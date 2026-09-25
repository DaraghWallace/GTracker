import { handler } from './getClientLatestSession';

const fakeProfiles: Record<string, any> = {
  CLIENT_1: { userId: "CLIENT_1", currentTrainerId: "TRAINER_1" },
  CLIENT_2: { userId: "CLIENT_2", currentTrainerId: "SOMEONE_ELSE" },
};

const fakeSessions: Record<string, any[]> = {
  CLIENT_1: [{ sessionId: "S1", userId: "CLIENT_1", dateDone: "2026-09-01", focus: "Legs" }],
  CLIENT_NO_SESSIONS: [],
};

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
          if (command instanceof actual.QueryCommand) {
            const clientId = command.input.ExpressionAttributeValues?.[":uid"];
            return Promise.resolve({ Items: fakeSessions[clientId] ?? [] });
          }
          return Promise.resolve({});
        })
      })
    }
  };
});

describe('getClientLatestSession handler', () => {
  beforeEach(() => {
    process.env.SESSIONS_TABLE = "Sessions";
    process.env.USER_PROFILES_TABLE = "UserProfiles";
  });

  test('returns 401 if unauthenticated', async () => {
    const response = await handler({
      pathParameters: { clientId: "CLIENT_1" },
      requestContext: { authorizer: { claims: { sub: null } } },
    } as any);
    expect(response.statusCode).toBe(401);
  });

  test('returns 403 if caller is not a trainer', async () => {
    const response = await handler({
      pathParameters: { clientId: "CLIENT_1" },
      requestContext: { authorizer: { claims: { sub: "TRAINER_1", "cognito:groups": "members" } } },
    } as any);
    expect(response.statusCode).toBe(403);
  });

  test('returns 400 if clientId missing', async () => {
    const response = await handler({
      pathParameters: null,
      requestContext: { authorizer: { claims: { sub: "TRAINER_1", "cognito:groups": "trainers" } } },
    } as any);
    expect(response.statusCode).toBe(400);
  });

  test('returns 403 if trainer is not this client\'s coach', async () => {
    const response = await handler({
      pathParameters: { clientId: "CLIENT_2" },
      requestContext: { authorizer: { claims: { sub: "TRAINER_1", "cognito:groups": "trainers" } } },
    } as any);
    expect(response.statusCode).toBe(403);
  });

  test('returns 200 with the latest session', async () => {
    const response = await handler({
      pathParameters: { clientId: "CLIENT_1" },
      requestContext: { authorizer: { claims: { sub: "TRAINER_1", "cognito:groups": "trainers" } } },
    } as any);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).sessionId).toBe("S1");
  });

  test('returns 200 with null when client has no sessions', async () => {
    fakeProfiles["CLIENT_NO_SESSIONS"] = { userId: "CLIENT_NO_SESSIONS", currentTrainerId: "TRAINER_1" };
    const response = await handler({
      pathParameters: { clientId: "CLIENT_NO_SESSIONS" },
      requestContext: { authorizer: { claims: { sub: "TRAINER_1", "cognito:groups": "trainers" } } },
    } as any);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toBeNull();
  });
});