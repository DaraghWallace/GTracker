import { handler } from './removeClient';

jest.mock('@aws-sdk/lib-dynamodb', () => {
  const actual = jest.requireActual('@aws-sdk/lib-dynamodb');
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: () => ({
        send: jest.fn((command) => {
          if (command instanceof actual.UpdateCommand) {
            const clientId = command.input.Key?.userId;
            if (clientId === "NOT_YOUR_CLIENT") {
              const err: any = new Error("Conditional check failed");
              err.name = "ConditionalCheckFailedException";
              return Promise.reject(err);
            }
            return Promise.resolve({});
          }
          return Promise.resolve({});
        })
      })
    }
  };
});

describe('removeClient handler', () => {
  beforeEach(() => {
    process.env.USER_PROFILES_TABLE = "UserProfiles";
  });

  test('returns 401 if unauthenticated', async () => {
    const response = await handler({
      requestContext: { authorizer: { claims: { sub: null } } },
      body: JSON.stringify({ clientId: "CLIENT_1" }),
    } as any);
    expect(response.statusCode).toBe(401);
  });

  test('returns 400 if clientId missing', async () => {
    const response = await handler({
      requestContext: { authorizer: { claims: { sub: "TRAINER_1" } } },
      body: JSON.stringify({}),
    } as any);
    expect(response.statusCode).toBe(400);
  });

  test('returns 403 if caller is not a trainer', async () => {
    const response = await handler({
      requestContext: { authorizer: { claims: { sub: "TRAINER_1", "cognito:groups": "members" } } },
      body: JSON.stringify({ clientId: "CLIENT_1" }),
    } as any);
    expect(response.statusCode).toBe(403);
  });

  test('returns 200 on successful release', async () => {
    const response = await handler({
      requestContext: { authorizer: { claims: { sub: "TRAINER_1", "cognito:groups": "trainers" } } },
      body: JSON.stringify({ clientId: "CLIENT_1" }),
    } as any);
    expect(response.statusCode).toBe(200);
  });

  test('returns 409 if client is not currently this trainer\'s', async () => {
    const response = await handler({
      requestContext: { authorizer: { claims: { sub: "TRAINER_1", "cognito:groups": "trainers" } } },
      body: JSON.stringify({ clientId: "NOT_YOUR_CLIENT" }),
    } as any);
    expect(response.statusCode).toBe(409);
  });
});
