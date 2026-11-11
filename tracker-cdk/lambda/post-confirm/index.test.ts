import { handler } from './index';

let mockPuts: any[] = [];
let mockPutError: any = null;

jest.mock('@aws-sdk/lib-dynamodb', () => {
  const actual = jest.requireActual('@aws-sdk/lib-dynamodb');
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: () => ({
        send: jest.fn((command) => {
          if (command instanceof actual.PutCommand) {
            if (mockPutError) return Promise.reject(mockPutError);
            // Real DynamoDB rejects undefined values, so the fake does too.
            for (const [name, value] of Object.entries(command.input.Item ?? {})) {
              if (value === undefined) return Promise.reject(new Error(`undefined value for ${name}`));
            }
            mockPuts.push(command.input);
          }
          return Promise.resolve({});
        })
      })
    }
  };
});

const signUpEvent = (attributes: Record<string, string>, triggerSource = "PostConfirmation_ConfirmSignUp") => ({
  triggerSource,
  request: { userAttributes: attributes },
  response: {},
} as any);

beforeEach(() => {
  mockPuts = [];
  mockPutError = null;
  process.env.TABLE_NAME = "GtUserProfiles";
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('sign-up confirmation', () => {
  test('creates the profile and returns the event', async () => {
    const event = signUpEvent({ sub: "USER_1", email: "dave@example.com", nickname: "Dave" });
    const result = await handler(event);

    expect(result).toBe(event);
    expect(mockPuts.length).toBe(1);
    expect(mockPuts[0].TableName).toBe("GtUserProfiles");
    expect(mockPuts[0].Item).toMatchObject({ userId: "USER_1", email: "dave@example.com", nickname: "Dave" });
    expect(mockPuts[0].ConditionExpression).toBe("attribute_not_exists(userId)");
  });

  test('custom:userType is never copied into the profile', async () => {
    await handler(signUpEvent({ sub: "USER_1", email: "a@b.com", nickname: "Dave", "custom:userType": "developer" }));
    expect("userType" in mockPuts[0].Item).toBe(false);
    expect(JSON.stringify(mockPuts[0].Item)).not.toContain("developer");
  });
});

describe('item: password reset', () => {
  test('a forgot-password confirmation writes nothing and does not fail', async () => {
    const event = signUpEvent({ sub: "USER_1", email: "a@b.com", nickname: "Dave" }, "PostConfirmation_ConfirmForgotPassword");
    const result = await handler(event);
    expect(result).toBe(event);
    expect(mockPuts.length).toBe(0);
  });
});

describe('unusual sign-up input', () => {
  test('a missing nickname gets a default instead of crashing', async () => {
    await handler(signUpEvent({ sub: "USER_1", email: "a@b.com" }));
    expect(mockPuts[0].Item.nickname).toBe("Member");
  });

  test('blank nickname gets the default', async () => {
    await handler(signUpEvent({ sub: "USER_1", email: "a@b.com", nickname: "   " }));
    expect(mockPuts[0].Item.nickname).toBe("Member");
  });

  test('a long nickname is cut to 50 characters', async () => {
    await handler(signUpEvent({ sub: "USER_1", email: "a@b.com", nickname: "x".repeat(500) }));
    expect(mockPuts[0].Item.nickname.length).toBe(50);
  });

  test('a nickname is trimmed', async () => {
    await handler(signUpEvent({ sub: "USER_1", email: "a@b.com", nickname: "  Dave  " }));
    expect(mockPuts[0].Item.nickname).toBe("Dave");
  });

  test('a missing email is left out (no undefined value reaches DynamoDB)', async () => {
    const event = signUpEvent({ sub: "USER_1", nickname: "Dave" });
    await expect(handler(event)).resolves.toBe(event);
    expect("email" in mockPuts[0].Item).toBe(false);
  });
});

describe('failures', () => {
  test('an existing profile is left alone and the user is not blocked', async () => {
    mockPutError = Object.assign(new Error("The conditional request failed"), { name: "ConditionalCheckFailedException" });
    const event = signUpEvent({ sub: "USER_1", email: "a@b.com", nickname: "Dave" });
    await expect(handler(event)).resolves.toBe(event);
  });

  test('any other database error is thrown, so Cognito shows the failure', async () => {
    mockPutError = new Error("DynamoDB exploded");
    await expect(handler(signUpEvent({ sub: "USER_1", email: "a@b.com", nickname: "Dave" }))).rejects.toThrow("DynamoDB exploded");
  });
});
