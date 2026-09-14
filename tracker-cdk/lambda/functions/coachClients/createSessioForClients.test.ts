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

describe('createSessionForClient handler', () => {
  beforeEach(() => {
    process.env.SESSIONS_TABLE = "Sessions";
    process.env.USER_PROFILES_TABLE = "UserProfiles";
    lastPutItem = null;
  });

  test('returns 401 if unauthenticated', async () => {
    const response = await handler({
      requestContext: { authorizer: { claims: { sub: null } } },
      body: JSON.stringify({ traineeId: "CLIENT_1" }),
    } as any);
    expect(response.statusCode).toBe(401);
  });

  test('returns 403 if caller is not a trainer', async () => {
    const response = await handler({
      requestContext: { authorizer: { claims: { sub: "TRAINER_1", "cognito:groups": "members" } } },
      body: JSON.stringify({ traineeId: "CLIENT_1" }),
    } as any);
    expect(response.statusCode).toBe(403);
  });

  test('returns 400 if traineeId missing', async () => {
    const response = await handler({
      requestContext: { authorizer: { claims: { sub: "TRAINER_1", "cognito:groups": "trainers" } } },
      body: JSON.stringify({}),
    } as any);
    expect(response.statusCode).toBe(400);
  });

  test('returns 403 if trainer is not this client\'s coach', async () => {
    const response = await handler({
      requestContext: { authorizer: { claims: { sub: "TRAINER_1", "cognito:groups": "trainers" } } },
      body: JSON.stringify({ traineeId: "CLIENT_2" }), // belongs to SOMEONE_ELSE
    } as any);
    expect(response.statusCode).toBe(403);
  });

  test('returns 200 and writes session with correct userId/createdBy', async () => {
    const response = await handler({
      requestContext: { authorizer: { claims: { sub: "TRAINER_1", "cognito:groups": "trainers" } } },
      body: JSON.stringify({ traineeId: "CLIENT_1", focus: "Legs" }),
    } as any);
    expect(response.statusCode).toBe(200);
    expect(lastPutItem.userId).toBe("CLIENT_1");
    expect(lastPutItem.createdBy).toBe("TRAINER_1");
    expect(lastPutItem.focus).toBe("Legs");
  });
});