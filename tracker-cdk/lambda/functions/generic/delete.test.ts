import { handler } from './delete';

const fakeTables: Record<string, { idField: string; item: Record<string, any> }> = {
  Sessions:         { idField: "sessionId",         item: { sessionId: "item_1",         userId: "OWNER" } },
  SessionExercises: { idField: "sessionExerciseId", item: { sessionExerciseId: "item_1", userId: "OWNER" } },
  Exercises:        { idField: "exerciseId",        item: { exerciseId: "item_1",        userId: "SOME_ADMIN" } },
};

let deleteCalls: any[] = [];

jest.mock('@aws-sdk/lib-dynamodb', () => {
  const actual = jest.requireActual('@aws-sdk/lib-dynamodb');
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: () => ({
        send: jest.fn((command) => {
          const table = fakeTables[process.env.TABLE_NAME ?? ""];

          if (command instanceof actual.GetCommand) {
            if (!table) return Promise.resolve({ Item: undefined });
            const requestedKey = command.input.Key ?? {};
            const idMatches = requestedKey[table.idField] === table.item[table.idField];
            const keyHasUserId = "userId" in requestedKey;
            const userMatches = keyHasUserId ? requestedKey.userId === table.item.userId : true;
            return Promise.resolve({ Item: idMatches && userMatches ? table.item : undefined });
          }

          if (command instanceof actual.DeleteCommand) {
            deleteCalls.push(command);
            return Promise.resolve({});
          }

          return Promise.resolve({});
        })
      })
    }
  };
});


const member = (sub: string) => ({ sub, "cognito:groups": "members" });
const admin  = (sub: string) => ({ sub, "cognito:groups": "admins" });

async function deleteFrom(tableName: string, claims: Record<string, any>, pathParameters: Record<string, string>) {
  process.env.TABLE_NAME = tableName;
  const response = await handler({
    requestContext: { authorizer: { claims } },
    pathParameters,
  } as any);
  return response.statusCode;
}

beforeEach(() => {
  deleteCalls = [];
});

test('401 when there is no sub', async () => {
  expect(await deleteFrom("Sessions", { sub: null }, { sessionId: "item_1" })).toBe(401);
  expect(deleteCalls.length).toBe(0);
});

describe('Sessions', () => {
  test('owner deletes own session (200)', async () => {
    expect(await deleteFrom("Sessions", member("OWNER"), { sessionId: "item_1" })).toBe(200);
    expect(deleteCalls.length).toBe(1);
  });

  test("another user cannot delete it (404, nothing deleted)", async () => {
    expect(await deleteFrom("Sessions", member("OTHER"), { sessionId: "item_1" })).toBe(404);
    expect(deleteCalls.length).toBe(0);
  });

  test("admin cannot delete someone else's session (404): no admin delete for now", async () => {
    expect(await deleteFrom("Sessions", admin("ADMIN_2"), { sessionId: "item_1" })).toBe(404);
    expect(deleteCalls.length).toBe(0);
  });
});

describe('SessionExercises', () => {
  test('owner deletes own session exercise (200)', async () => {
    expect(await deleteFrom("SessionExercises", member("OWNER"), { sessionExerciseId: "item_1" })).toBe(200);
    expect(deleteCalls.length).toBe(1);
  });

  test("another user cannot delete it (403, nothing deleted)", async () => {
    expect(await deleteFrom("SessionExercises", member("OTHER"), { sessionExerciseId: "item_1" })).toBe(403);
    expect(deleteCalls.length).toBe(0);
  });

  test("admin cannot delete someone else's session exercise (403): no admin delete for now", async () => {
    expect(await deleteFrom("SessionExercises", admin("ADMIN_2"), { sessionExerciseId: "item_1" })).toBe(403);
    expect(deleteCalls.length).toBe(0);
  });
});

describe('Exercises', () => {
  test('admin deletes an exercise created by another admin (200)', async () => {
    expect(await deleteFrom("Exercises", admin("ADMIN_2"), { exerciseId: "item_1" })).toBe(200);
    expect(deleteCalls.length).toBe(1);
  });

  test('admin deletes an exercise that has no userId (200)', async () => {
    const original = fakeTables.Exercises.item;
    fakeTables.Exercises.item = { exerciseId: "item_1" };
    try {
      expect(await deleteFrom("Exercises", admin("ADMIN_2"), { exerciseId: "item_1" })).toBe(200);
    } finally {
      fakeTables.Exercises.item = original;
    }
  });

  test('member cannot delete an exercise (403, nothing deleted)', async () => {
    expect(await deleteFrom("Exercises", member("OWNER"), { exerciseId: "item_1" })).toBe(403);
    expect(deleteCalls.length).toBe(0);
  });

  test('spoofed custom:userType developer, with no group, cannot delete (403)', async () => {
    const claims = { sub: "ATTACKER", "custom:userType": "developer" };
    expect(await deleteFrom("Exercises", claims, { exerciseId: "item_1" })).toBe(403);
    expect(deleteCalls.length).toBe(0);
  });
});