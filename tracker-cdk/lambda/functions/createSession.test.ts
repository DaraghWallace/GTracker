import { handler } from './createSession';

let putCommands: any[] = [];
let failNextPut = false;

jest.mock('@aws-sdk/lib-dynamodb', () => {
  const actual = jest.requireActual('@aws-sdk/lib-dynamodb');
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: () => ({
        send: jest.fn((command) => {
          if (command instanceof actual.PutCommand) {
            if (failNextPut) return Promise.reject(new Error("DynamoDB exploded"));
            // Real DynamoDB rejects undefined values, so the fake does too.
            for (const [name, value] of Object.entries(command.input.Item ?? {})) {
              if (value === undefined) return Promise.reject(new Error(`undefined value for ${name}`));
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

const owner = { sub: "OWNER", "cognito:groups": "members" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

async function create(claims: Record<string, any>, body: any) {
  process.env.SESSIONS_TABLE = "Sessions";
  return handler({
    requestContext: { authorizer: { claims } },
    body: typeof body === "string" ? body : JSON.stringify(body),
  } as any);
}

beforeEach(() => {
  putCommands = [];
  failNextPut = false;
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

// --- Identity (401) ---
test('401 when there is no sub', async () => {
  const response = await create({ sub: null }, { userWeight: 80 });
  expect(response.statusCode).toBe(401);
  expect(putCommands.length).toBe(0);
});

// --- The happy path ---
describe('creating a session', () => {
  test('200, stores the item for the caller and returns it', async () => {
    const response = await create(owner, { userWeight: 80, focus: "Legs", notes: "felt good" });
    expect(response.statusCode).toBe(200);
    expect(putCommands.length).toBe(1);

    const stored = putCommands[0].Item;
    expect(stored.userId).toBe("OWNER");
    expect(stored.userWeight).toBe(80);
    expect(stored.focus).toBe("Legs");
    expect(stored.notes).toBe("felt good");

    // the reply carries the same item, so the frontend can read the server-made id
    expect(JSON.parse(response.body)).toEqual(stored);
  });

  test('focus and notes default to null when not sent', async () => {
    await create(owner, { userWeight: 80 });
    expect(putCommands[0].Item.focus).toBeNull();
    expect(putCommands[0].Item.notes).toBeNull();
  });

  test('the write carries the "must not already exist" condition', async () => {
    await create(owner, { userWeight: 80 });
    expect(putCommands[0].ConditionExpression).toBe("attribute_not_exists(sessionId)");
  });
});

// --- the client cant choose ids ---
describe('item 2.12: the server owns the ids', () => {
  test("a sessionId in the body is ignored and a fresh uuid is used", async () => {
    await create(owner, { sessionId: "VICTIMS_SESSION_ID", userWeight: 80 });
    const id = putCommands[0].Item.sessionId;
    expect(id).not.toBe("VICTIMS_SESSION_ID");
    expect(id).toMatch(UUID);
  });

  test('two creates never share an id', async () => {
    await create(owner, { userWeight: 80 });
    await create(owner, { userWeight: 80 });
    expect(putCommands[0].Item.sessionId).not.toBe(putCommands[1].Item.sessionId);
  });

  test('a userId in the body is ignored', async () => {
    await create(owner, { userId: "VICTIM", userWeight: 80 });
    expect(putCommands[0].Item.userId).toBe("OWNER");
  });

  test('a dateDone in the body is ignored (server date is used)', async () => {
    await create(owner, { dateDone: "1999-01-01", userWeight: 80 });
    expect(putCommands[0].Item.dateDone).not.toBe("1999-01-01");
    expect(putCommands[0].Item.dateDone).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  test('extra fields in the body are dropped', async () => {
    await create(owner, { userWeight: 80, isAdmin: true, createdBy: "VICTIM" });
    expect(Object.keys(putCommands[0].Item).sort()).toEqual(
      ["dateDone", "focus", "notes", "sessionId", "userId", "userWeight"]
    );
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
    expect(putCommands.length).toBe(0);
  });

  test.each([
    ["null",  "null"],
    ["an array", "[]"],
    ["a string", "\"hi\""],
  ])('400 when the body is %s', async (_name, raw) => {
    const response = await create(owner, raw);
    expect(response.statusCode).toBe(400);
    expect(putCommands.length).toBe(0);
  });

  test.each([
    ["weight is a string",     { userWeight: "80" }],
    ["weight is negative",     { userWeight: -1 }],
    ["weight is over 500",     { userWeight: 501 }],
    ["focus is a number",      { focus: 5 }],
    ["focus is too long",      { focus: "x".repeat(51) }],
    ["notes is an object",     { notes: {} }],
    ["notes is too long",      { notes: "x".repeat(501) }],
  ])('400 when %s (nothing written)', async (_name, patch) => {
    const response = await create(owner, { userWeight: 80, ...patch });
    expect(response.statusCode).toBe(400);
    expect(putCommands.length).toBe(0);
  });
});

// --- Failures ---
test('500 when the database write fails, without leaking the error text', async () => {
  failNextPut = true;
  const response = await create(owner, { userWeight: 80 });
  expect(response.statusCode).toBe(500);
  expect(response.body).not.toContain("exploded");
});
