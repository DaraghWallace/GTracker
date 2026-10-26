import { handler } from './createSessionForClient';

const fakeProfiles: Record<string, any> = {
  CLIENT_1: { userId: "CLIENT_1", currentTrainerId: "TRAINER_1" },
  CLIENT_2: { userId: "CLIENT_2", currentTrainerId: "SOMEONE_ELSE" },
};

let lastPutItem: any = null;
jest.mock('@aws-sdk/lib-dynamodb', () => {
  const actual = jest.requireActual('@aws-sdk/lib-dynamodb');
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: () => ({
        send: jest.fn((command) => {
          if (command instanceof actual.GetCommand) {
            const clientId = command.input.Key?.userId;
            return Promise.resolve({ Item: fakeProfiles[clientId] });
          }
          if (command instanceof actual.PutCommand) {
            lastPutItem = command.input.Item;
            return Promise.resolve({});
          }
          return Promise.resolve({});
        })
      })
    }
  };
});

const makeEvent = (claims: Record<string, any>, body: any) => ({
    requestContext: { authorizer: { claims } },
    body: typeof body === "string" ? body : JSON.stringify(body), 
}) as any;

describe('createSessionForClient handler', () => {
  beforeEach(() => {
    process.env.SESSIONS_TABLE = "Sessions";
    process.env.USER_PROFILES_TABLE = "UserProfiles";
    lastPutItem = null;
  });

  test('returns 401 if unauthenticated', async () => {
    const response = await handler(makeEvent({ sub: null }, { clientId: "CLIENT_1" }));
    expect(response.statusCode).toBe(401);
    expect(lastPutItem).toBeNull();
  });

  test('returns 403 for members group', async () => {
    const response = await handler(
      makeEvent({ sub: "MEMBER_1", "cognito:groups": "members" }, { clientId: "CLIENT_1" })
    );
    expect(response.statusCode).toBe(403);
    expect(lastPutItem).toBeNull();
  });

  test('returns 403 when only custom:userType says (spoofed role)', async () => {
    const response = await handler(
      makeEvent({ sub: "TRAINER_1", "custom:userType": "spoof" }, { clientId: "CLIENT_1" })
    );
    expect(response.statusCode).toBe(403);
    expect(lastPutItem).toBeNull();
  });

  test('returns 400 if clientId missing', async () => {
    const response = await handler(
      makeEvent({ sub: "TRAINER_1", "cognito:groups": "trainers" }, {})
    );
    expect(response.statusCode).toBe(400);
    expect(lastPutItem).toBeNull();
  });

  test('returns 400 for invalid JSON', async () => {
    const response = await handler(
      makeEvent({ sub: "TRAINER_1", "cognito:groups": "trainers" }, "not json")
    );
    expect(response.statusCode).toBe(400);
    expect(lastPutItem).toBeNull();
  });

  test("returns 403 if trainer is not this client's coach", async () => {
    const response = await handler(
      makeEvent({ sub: "TRAINER_1", "cognito:groups": "trainers" }, { clientId: "CLIENT_2" }) // belongs to SOMEONE_ELSE
    );
    expect(response.statusCode).toBe(403);
    expect(lastPutItem).toBeNull();
  });    

  test('returns 200 and writes session with correct userId/createdBy (trainers)', async () => {
    const response = await handler(
      makeEvent(
        { sub: "TRAINER_1", "cognito:groups": "trainers" },
        { clientId: "CLIENT_1", exName: "lifts", date: "2026-10-26" }
      )
    );
    expect(response.statusCode).toBe(200);
    expect(lastPutItem.userId).toBe("CLIENT_1");
    expect(lastPutItem.createdBy).toBe("TRAINER_1");
    expect(lastPutItem.exName).toBe("lifts");
  });

  test('returns 200 and writes session with correct userId/createdBy (admins)', async () => {
    const response = await handler(
      makeEvent(
        { sub: "TRAINER_1", "cognito:groups": "admins" },
        { clientId: "CLIENT_1", exName: "lifts", date: "2026-10-26" }
      )
    );
    expect(response.statusCode).toBe(200);
    expect(lastPutItem.userId).toBe("CLIENT_1");
    expect(lastPutItem.createdBy).toBe("TRAINER_1");
    expect(lastPutItem.exName).toBe("lifts");
  });
})
