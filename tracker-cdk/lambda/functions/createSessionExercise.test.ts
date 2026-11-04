import { handler } from './createSessionExercise';

// --- The fake database ------------------------------------------------------
// One session that belongs to OWNER, and one session exercise that already exists.
const SESSION_ID = "session_A";
const EXISTING_ID = "11111111-1111-4111-8111-111111111111";
const NEW_ID      = "22222222-2222-4222-8222-222222222222";

let putCommands: any[] = [];
let failNextPut = false;

jest.mock('@aws-sdk/lib-dynamodb', () => {
  const actual = jest.requireActual('@aws-sdk/lib-dynamodb');
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: () => ({
        send: jest.fn((command) => {
          // Looking up a session: only found if BOTH parts of the key match.
          if (command instanceof actual.GetCommand) {
            const key = command.input.Key ?? {};
            const found = key.sessionId === "session_A" && key.userId === "OWNER";
            return Promise.resolve({ Item: found ? { sessionId: "session_A", userId: "OWNER" } : undefined });
          }

          if (command instanceof actual.PutCommand) {
            if (failNextPut) return Promise.reject(new Error("DynamoDB exploded"));
            // Behave like DynamoDB: if the condition says "must not exist" and it does, refuse.
            const wantsNew = command.input.ConditionExpression === "attribute_not_exists(sessionExerciseId)";
            if (wantsNew && command.input.Item?.sessionExerciseId === "11111111-1111-4111-8111-111111111111") {
              const err: any = new Error("The conditional request failed");
              err.name = "ConditionalCheckFailedException";
              return Promise.reject(err);
            }
            putCommands.push(command.input);
            return Promise.resolve({});
          }

          return Promise.resolve({});
        })
      })
    }
  };
});

const goodBody = () => ({
  sessionExerciseId: NEW_ID,
  sessionId: SESSION_ID,
  exerciseId: "bench",
  exerciseIndex: 1,
  toFailure: false,
  sets: "Wt(reps),25(10),27(8)",
});

async function create(claims: Record<string, any>, body: any) {
  process.env.SESSIONS_TABLE = "Sessions";
  process.env.SESSION_EXERCISES_TABLE = "SessionExercises";
  return handler({
    requestContext: { authorizer: { claims } },
    body: typeof body === "string" ? body : JSON.stringify(body),
  } as any);
}

const owner = { sub: "OWNER", "cognito:groups": "members" };

beforeEach(() => {
  putCommands = [];
  failNextPut = false;
  jest.spyOn(console, 'error').mockImplementation(() => {}); // keep test output quiet
});

test('401 when there is no sub', async () => {
  const response = await create({ sub: null }, goodBody());
  expect(response.statusCode).toBe(401);
  expect(putCommands.length).toBe(0);
});

describe('owner of the session', () => {
  test('creates a session exercise (200) and stamps the caller as owner', async () => {
    const response = await create(owner, goodBody());
    expect(response.statusCode).toBe(200);
    expect(putCommands.length).toBe(1);
    expect(putCommands[0].Item.userId).toBe("OWNER");
    expect(putCommands[0].Item.sessionId).toBe(SESSION_ID);
  });

  test('the write carries the "must not already exist" condition', async () => {
    await create(owner, goodBody());
    expect(putCommands[0].ConditionExpression).toBe("attribute_not_exists(sessionExerciseId)");
  });

  test('a userId in the body is ignored', async () => {
    await create(owner, { ...goodBody(), userId: "VICTIM" });
    expect(putCommands[0].Item.userId).toBe("OWNER");
  });

  test('extra fields in the body are dropped', async () => {
    await create(owner, { ...goodBody(), isAdmin: true, createdBy: "VICTIM" });
    expect(Object.keys(putCommands[0].Item).sort()).toEqual(
      ["exerciseId", "exerciseIndex", "sessionExerciseId", "sessionId", "sets", "toFailure", "userId"]
    );
  });
});

describe('session ownership', () => {
  test("someone else's session returns 404 and writes nothing", async () => {
    const response = await create({ sub: "ATTACKER", "cognito:groups": "members" }, goodBody());
    expect(response.statusCode).toBe(404);
    expect(putCommands.length).toBe(0);
  });

  test('a session that does not exist returns 404', async () => {
    const response = await create(owner, { ...goodBody(), sessionId: "no_such_session" });
    expect(response.statusCode).toBe(404);
    expect(putCommands.length).toBe(0);
  });

  test('an admin cannot attach to someone else\'s session either', async () => {
    const response = await create({ sub: "ADMIN_2", "cognito:groups": "admins" }, goodBody());
    expect(response.statusCode).toBe(404);
    expect(putCommands.length).toBe(0);
  });
});

describe('no overwriting', () => {
  test('an id that already exists returns 409 and writes nothing', async () => {
    const response = await create(owner, { ...goodBody(), sessionExerciseId: EXISTING_ID });
    expect(response.statusCode).toBe(409);
    expect(putCommands.length).toBe(0);
  });
});

// --- Bad input (400) ---
describe('bad input', () => {
  test('400 for invalid JSON', async () => {
    const response = await create(owner, "not json");
    expect(response.statusCode).toBe(400);
    expect(putCommands.length).toBe(0);
  });

  test('400 for a missing body', async () => {
    const response = await handler({ requestContext: { authorizer: { claims: owner } } } as any);
    expect(response.statusCode).toBe(400);
  });

  test('400 for a body of null', async () => {
    const response = await create(owner, "null");
    expect(response.statusCode).toBe(400);
  });

  test.each([
    ["id is not a uuid",        { sessionExerciseId: "abc" }],
    ["id is missing",           { sessionExerciseId: undefined }],
    ["sessionId is missing",    { sessionId: undefined }],
    ["sessionId is too long",   { sessionId: "x".repeat(65) }],
    ["exerciseId is a number",  { exerciseId: 5 }],
    ["index is negative",       { exerciseIndex: -1 }],
    ["index is not an integer", { exerciseIndex: 1.5 }],
    ["index is a string",       { exerciseIndex: "1" }],
    ["toFailure is a string",   { toFailure: "false" }],
    ["sets is missing",         { sets: undefined }],
    ["sets is too long",        { sets: "x".repeat(201) }],
  ])('400 when %s (nothing written)', async (_name, patch) => {
    const response = await create(owner, { ...goodBody(), ...patch });
    expect(response.statusCode).toBe(400);
    expect(putCommands.length).toBe(0);
  });
});

// --- Failures ---
test('500 when the database write fails, without leaking the error text', async () => {
  failNextPut = true;
  const response = await create(owner, goodBody());
  expect(response.statusCode).toBe(500);
  expect(response.body).not.toContain("exploded");
});
