// Behaviour tests: allow-lists, bad input, no error leakage, nothing written on rejection.
let puts: any[] = [];
let updates: any[] = [];
let failWith: any = null;

const clientsInDb = [{
  userId: "C1", currentTrainerId: "T1", nickname: "Bob",
  height_cm: 180, cur_weight: 80, tar_weight: 75, goal: "cut",
  email: "bob@x.com", userType: "member", secretField: "nope",
}];

jest.mock('@aws-sdk/lib-dynamodb', () => {
  const actual = jest.requireActual('@aws-sdk/lib-dynamodb');
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: () => ({
        send: jest.fn((command) => {
          if (failWith) return Promise.reject(failWith);
          if (command instanceof actual.PutCommand) { puts.push(command.input.Item); return Promise.resolve({}); }
          if (command instanceof actual.UpdateCommand) { updates.push(command.input); return Promise.resolve({}); }
          if (command instanceof actual.GetCommand) return Promise.resolve({ Item: { userId: "C1", currentTrainerId: "T1" } });
          if (command instanceof actual.QueryCommand) {
            if (command.input.IndexName === "email-index") return Promise.resolve({ Items: [clientsInDb[0]] });
            if (command.input.IndexName === "currentTrainerId-index") return Promise.resolve({ Items: clientsInDb });
            if (command.input.TableName === "S" && !command.input.IndexName) return Promise.resolve({ Items: [{ sessionId: "S1", userId: "C1" }] });
            return Promise.resolve({ Items: [] });
          }
          return Promise.resolve({});
        }),
      }),
    },
  };
});

import { handler as addClient } from './addClient';
import { handler as removeClient } from './removeClient';
import { handler as findByEmail } from './findByEmail';
import { handler as listClients } from './listClients';
import { handler as createSE } from './createSessionExerciseForClient';

const trainer = (sub = "T1") => ({ sub, "cognito:groups": "trainers" });
const ev = (claims: any, extra: Record<string, any> = {}) =>
  ({ requestContext: { authorizer: { claims } }, ...extra } as any);

beforeEach(() => {
  puts = []; updates = []; failWith = null;
  process.env.TABLE_NAME = "T";
  process.env.USER_PROFILES_TABLE = "P";
  process.env.SESSIONS_TABLE = "S";
  process.env.SESSION_EXERCISES_TABLE = "SE";
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('listClients', () => {
  test('returns only allow-listed fields', async () => {
    const r = await listClients(ev(trainer()));
    expect(r.statusCode).toBe(200);
    const first = JSON.parse(r.body)[0];
    expect(Object.keys(first).sort()).toEqual(["cur_weight", "goal", "height_cm", "nickname", "tar_weight", "userId"]);
  });
});

describe('findByEmail', () => {
  test('returns only userId and nickname', async () => {
    const r = await findByEmail(ev(trainer(), { queryStringParameters: { email: "bob@x.com" } }));
    expect(Object.keys(JSON.parse(r.body)).sort()).toEqual(["nickname", "userId"]);
  });
  test('400 with no email', async () => {
    expect((await findByEmail(ev(trainer(), { queryStringParameters: {} }))).statusCode).toBe(400);
  });
});

describe('addClient / removeClient', () => {
  test('addClient uses body.clientId and the caller as trainer', async () => {
    const r = await addClient(ev(trainer("T9"), { body: JSON.stringify({ clientId: "C1" }) }));
    expect(r.statusCode).toBe(200);
    expect(updates[0].Key).toEqual({ userId: "C1" });
    expect(updates[0].ExpressionAttributeValues[":trainerId"]).toBe("T9");
  });
  test.each([["invalid JSON", "not json"], ["no clientId", "{}"], ["clientId not a string", JSON.stringify({ clientId: { a: 1 } })]])(
    'addClient 400 for %s', async (_n, body) => {
      expect((await addClient(ev(trainer(), { body }))).statusCode).toBe(400);
      expect(updates.length).toBe(0);
    });
  test('removeClient 400 for invalid JSON', async () => {
    expect((await removeClient(ev(trainer(), { body: "not json" }))).statusCode).toBe(400);
  });
  test('409 when the condition fails', async () => {
    failWith = Object.assign(new Error("x"), { name: "ConditionalCheckFailedException" });
    expect((await addClient(ev(trainer(), { body: JSON.stringify({ clientId: "C1" }) }))).statusCode).toBe(409);
  });
  test('500 does not leak the error text', async () => {
    failWith = new Error("SECRET table name Foo-123");
    const r = await addClient(ev(trainer(), { body: JSON.stringify({ clientId: "C1" }) }));
    expect(r.statusCode).toBe(500);
    expect(r.body).not.toContain("SECRET");
  });
});

describe('createSessionExerciseForClient', () => {
  const good = { exerciseId: "E1", exerciseIndex: 0, toFailure: false, sets: "5x5" };
  const create = (body: any, claims = trainer()) =>
    createSE(ev(claims, { pathParameters: { sessionId: "S1" }, body: typeof body === "string" ? body : JSON.stringify(body) }));

  test('200 and stamps server-side ids', async () => {
    const r = await create({ ...good, userId: "VICTIM", createdBy: "EVIL", sessionId: "OTHER", sessionExerciseId: "CHOSEN" });
    expect(r.statusCode).toBe(200);
    expect(puts[0].userId).toBe("C1");
    expect(puts[0].createdBy).toBe("T1");
    expect(puts[0].sessionId).toBe("S1");
    expect(puts[0].sessionExerciseId).not.toBe("CHOSEN");
  });
  test('extra fields are dropped', async () => {
    await create({ ...good, isAdmin: true, junk: "x" });
    expect("isAdmin" in puts[0]).toBe(false);
    expect("junk" in puts[0]).toBe(false);
  });
  test.each([
    ["missing sets", { ...good, sets: undefined }],
    ["sets wrong type", { ...good, sets: 5 }],
    ["toFailure wrong type", { ...good, toFailure: "yes" }],
    ["negative index", { ...good, exerciseIndex: -1 }],
    ["body is null", "null"],
    ["invalid JSON", "not json"],
  ])('400 for %s (nothing written)', async (_n, body) => {
    expect((await create(body as any)).statusCode).toBe(400);
    expect(puts.length).toBe(0);
  });
  test('403 when the session belongs to a client of another trainer', async () => {
    expect((await create(good, trainer("T_OTHER"))).statusCode).toBe(403);
    expect(puts.length).toBe(0);
  });
});
