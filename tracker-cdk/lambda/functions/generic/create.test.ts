import { handler } from './create';

let putItems: any[] = [];

jest.mock('@aws-sdk/lib-dynamodb', () => {
  const actual = jest.requireActual('@aws-sdk/lib-dynamodb');
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: () => ({
        send: jest.fn((command) => {
          if (command instanceof actual.PutCommand) putItems.push(command.input.Item);
          return Promise.resolve({});
        })
      })
    }
  };
});

const member = (sub: string) => ({ sub, "cognito:groups": "members" });
const admin  = (sub: string) => ({ sub, "cognito:groups": "admins" });

async function create(tableName: string, claims: Record<string, any>, body?: string) {
  process.env.TABLE_NAME = tableName;
  return handler({ requestContext: { authorizer: { claims } }, body } as any);
}

beforeEach(() => { putItems = []; });

// Any signed-in user may create these. Exercises are admin-only (tested below).
describe.each(["Sessions", "SessionExercises"])("create handler: %s", (tableName) => {
  test('member creates (200) and the item is stamped with the caller', async () => {
    const r = await create(tableName, member("U1"), JSON.stringify({ someField: "x" }));
    expect(r.statusCode).toBe(200);
    expect(putItems[0].userId).toBe("U1");
  });

  test('a userId in the body is ignored', async () => {
    await create(tableName, member("U1"), JSON.stringify({ userId: "VICTIM" }));
    expect(putItems[0].userId).toBe("U1");
  });

  test('400 for missing body', async () => {
    expect((await create(tableName, member("U1"))).statusCode).toBe(400);
    expect(putItems.length).toBe(0);
  });

  test('400 for invalid JSON', async () => {
    expect((await create(tableName, member("U1"), "{not valid json")).statusCode).toBe(400);
    expect(putItems.length).toBe(0);
  });

  test('401 with no sub', async () => {
    expect((await create(tableName, { sub: null }, JSON.stringify({ a: 1 }))).statusCode).toBe(401);
    expect(putItems.length).toBe(0);
  });
});

describe("create handler: Exercises (admin only)", () => {
  test('admin creates (200)', async () => {
    expect((await create("Exercises", admin("A1"), JSON.stringify({ name: "Curl" }))).statusCode).toBe(200);
    expect(putItems.length).toBe(1);
  });

  test('member is rejected (403, nothing written)', async () => {
    expect((await create("Exercises", member("U1"), JSON.stringify({ name: "Curl" }))).statusCode).toBe(403);
    expect(putItems.length).toBe(0);
  });

  test('spoofed custom:userType developer, no group, is rejected (403)', async () => {
    const claims = { sub: "ATTACKER", "custom:userType": "developer" };
    expect((await create("Exercises", claims, JSON.stringify({ name: "x" }))).statusCode).toBe(403);
    expect(putItems.length).toBe(0);
  });

  test('401 with no sub', async () => {
    expect((await create("Exercises", { sub: null }, JSON.stringify({ a: 1 }))).statusCode).toBe(401);
  });

  test('admin: 400 for missing body and for invalid JSON', async () => {
    expect((await create("Exercises", admin("A1"))).statusCode).toBe(400);
    expect((await create("Exercises", admin("A1"), "{nope")).statusCode).toBe(400);
  });
});
