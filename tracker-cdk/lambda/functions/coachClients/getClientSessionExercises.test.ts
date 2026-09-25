import { handler } from './getClientSessionExercises';

const fakeProfiles: Record<string, any> = {
  CLIENT_1: { userId: "CLIENT_1", currentTrainerId: "TRAINER_1" },
  CLIENT_2: { userId: "CLIENT_2", currentTrainerId: "SOMEONE_ELSE" },
};

const fakeSessions: Record<string, any> = {
  SESSION_1: { sessionId: "SESSION_1", userId: "CLIENT_1", dateDone: "2026-09-01" },
  SESSION_2: { sessionId: "SESSION_2", userId: "CLIENT_2", dateDone: "2026-09-02" },
};

const fakeExercises: Record<string, any[]> = {
  SESSION_1: [{ sessionExerciseId: "EX_1", sessionId: "SESSION_1", exercise: "Bench Press" }],
};

jest.mock('@aws-sdk/lib-dynamodb', () => {
  const actual = jest.requireActual('@aws-sdk/lib-dynamodb');
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: () => ({
        send: jest.fn((command) => {
          if (command instanceof actual.QueryCommand) {
            const sid = command.input.ExpressionAttributeValues?.[":sid"];
            if (command.input.IndexName === "sessionId-index") {
              return Promise.resolve({ Items: fakeExercises[sid] ?? [] });
            }
            // Sessions table query by sessionId
            return Promise.resolve({ Items: fakeSessions[sid] ? [fakeSessions[sid]] : [] });
          }
          if (command instanceof actual.GetCommand) {
            const clientId = command.input.Key?.userId;
            return Promise.resolve({ Item: fakeProfiles[clientId] });
          }
          return Promise.resolve({});
        })
      })
    }
  };
});

describe('getClientSessionExercises handler', () => {
  beforeEach(() => {
    process.env.SESSION_EXERCISES_TABLE = "SessionExercises";
    process.env.SESSIONS_TABLE = "Sessions";
    process.env.USER_PROFILES_TABLE = "UserProfiles";
  });

  test('returns 401 if unauthenticated', async () => {
    const response = await handler({
      pathParameters: { sessionId: "SESSION_1" },
      requestContext: { authorizer: { claims: { sub: null } } },
    } as any);
    expect(response.statusCode).toBe(401);
  });

  test('returns 403 if caller is not a trainer', async () => {
    const response = await handler({
      pathParameters: { sessionId: "SESSION_1" },
      requestContext: { authorizer: { claims: { sub: "TRAINER_1", "cognito:groups": "members" } } },
    } as any);
    expect(response.statusCode).toBe(403);
  });

  test('returns 400 if sessionId missing', async () => {
    const response = await handler({
      pathParameters: null,
      requestContext: { authorizer: { claims: { sub: "TRAINER_1", "cognito:groups": "trainers" } } },
    } as any);
    expect(response.statusCode).toBe(400);
  });

  test('returns 404 if session does not exist', async () => {
    const response = await handler({
      pathParameters: { sessionId: "NONEXISTENT" },
      requestContext: { authorizer: { claims: { sub: "TRAINER_1", "cognito:groups": "trainers" } } },
    } as any);
    expect(response.statusCode).toBe(404);
  });

  test('returns 403 if trainer is not this client\'s coach', async () => {
    const response = await handler({
      pathParameters: { sessionId: "SESSION_2" }, // belongs to CLIENT_2, coached by SOMEONE_ELSE
      requestContext: { authorizer: { claims: { sub: "TRAINER_1", "cognito:groups": "trainers" } } },
    } as any);
    expect(response.statusCode).toBe(403);
  });

  test('returns 200 with the session\'s exercises', async () => {
    const response = await handler({
      pathParameters: { sessionId: "SESSION_1" },
      requestContext: { authorizer: { claims: { sub: "TRAINER_1", "cognito:groups": "trainers" } } },
    } as any);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toHaveLength(1);
  });
});