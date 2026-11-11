import { handler } from './getBySession';

process.env.TABLE_NAME = "SessionExercises";
process.env.OTHER_TABLE = "Sessions";


jest.mock('@aws-sdk/lib-dynamodb', () => {
  const actual = jest.requireActual('@aws-sdk/lib-dynamodb');
  const sessions = [
    { sessionId: "sess_1",  userId: "OWNER" },
    { sessionId: "shared",  userId: "ATTACKER" },
    { sessionId: "shared",  userId: "VICTIM" },
  ];
  const sessionExercises = [
    { sessionExerciseId: "se_1", sessionId: "sess_1", userId: "OWNER" },
    { sessionExerciseId: "se_2", sessionId: "shared", userId: "VICTIM" },
    { sessionExerciseId: "se_3", sessionId: "shared", userId: "ATTACKER" },
  ];
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: () => ({
        send: jest.fn((command) => {
          if (mockFailNextSend) return Promise.reject(new Error("DynamoDB exploded"));

          if (command instanceof actual.GetCommand) {
            const key = command.input.Key ?? {};
            mockGetKeys.push(key);
            const item = sessions.find((s) => s.sessionId === key.sessionId && s.userId === key.userId);
            return Promise.resolve({ Item: item });
          }

          if (command instanceof actual.QueryCommand) {
            const values = command.input.ExpressionAttributeValues ?? {};
            let items = sessionExercises.filter((e) => e.sessionId === values[":sid"]);
            if (command.input.FilterExpression === "userId = :uid") { // Behave like DynamoDB: apply the filter if one was sent.
              items = items.filter((e) => e.userId === values[":uid"]);
            }
            return Promise.resolve({ Items: items });
          }

          return Promise.resolve({});
        })
      })
    }
  };
});

let mockGetKeys: any[] = [];
let mockFailNextSend = false;

const event = (sub: string | null, sessionId?: string) => ({
  queryStringParameters: sessionId ? { sessionId } : undefined,
  requestContext: { authorizer: { claims: { sub } } },
} as any);

beforeEach(() => {
  mockGetKeys = [];
  mockFailNextSend = false;
  jest.spyOn(console, 'error').mockImplementation(() => {}); // keep test output quiet
});

test('returns 200 and the exercises when the caller owns the session', async () => {
  const response = await handler(event("OWNER", "sess_1"));
  expect(response.statusCode).toBe(200);
  expect(JSON.parse(response.body).map((e: any) => e.sessionExerciseId)).toEqual(["se_1"]);
});

test('returns 400 for missing sessionId', async () => {
  const response = await handler(event("OWNER"));
  expect(response.statusCode).toBe(400);
});

test('returns 401 when caller is not authenticated', async () => {
  const response = await handler(event(null, "sess_1"));
  expect(response.statusCode).toBe(401);
});

test("returns 404 (not 403) for someone else's session", async () => {
  const response = await handler(event("FAKE_USER", "sess_1"));
  expect(response.statusCode).toBe(404);
});

test('returns 404 for a session that does not exist', async () => {
  const response = await handler(event("OWNER", "nope"));
  expect(response.statusCode).toBe(404);
});

describe('item 2.12: two users share a sessionId', () => {
  test('the victim still gets 200 (the lookup uses the full key, not "first row")', async () => {
    const response = await handler(event("VICTIM", "shared"));
    expect(response.statusCode).toBe(200);
  });

  test('the session lookup asks for BOTH parts of the key', async () => {
    await handler(event("VICTIM", "shared"));
    expect(mockGetKeys).toEqual([{ sessionId: "shared", userId: "VICTIM" }]);
  });

  test("an exercise planted by another user is NOT returned to the victim", async () => {
    const response = await handler(event("VICTIM", "shared"));
    const ids = JSON.parse(response.body).map((e: any) => e.sessionExerciseId);
    expect(ids).toEqual(["se_2"]);
    expect(ids).not.toContain("se_3");
  });
});

test('500 with a generic message when the database fails', async () => {
  mockFailNextSend = true;
  const response = await handler(event("OWNER", "sess_1"));
  expect(response.statusCode).toBe(500);
  expect(response.body).not.toContain("exploded");
});
