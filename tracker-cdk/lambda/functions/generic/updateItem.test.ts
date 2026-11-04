import { handler } from './updateItem';

// --- The fake database: one pretend item per table ------------------------
const fakeTables: Record<string, { idField: string; item: Record<string, any> }> = {
  Sessions:         { idField: "sessionId",         item: { sessionId: "item_1",         userId: "OWNER" } },
  SessionExercises: { idField: "sessionExerciseId", item: { sessionExerciseId: "item_1", userId: "OWNER", sessionId: "SESSION_A" } },
  // Exercises carry the id of the admin who created them, but that is NOT an owner.
  Exercises:        { idField: "exerciseId",        item: { exerciseId: "item_1",        userId: "SOME_ADMIN" } },
};

// Everything the handler wrote, so tests can check what was (or wasn't) saved.
let putItems: any[] = [];
let failNextPut = false;

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
            // Only the Sessions key includes userId; if it does, it must match too.
            const keyHasUserId = "userId" in requestedKey;
            const userMatches = keyHasUserId ? requestedKey.userId === table.item.userId : true;
            return Promise.resolve({ Item: idMatches && userMatches ? table.item : undefined });
          }

          if (command instanceof actual.PutCommand) {
            if (failNextPut) return Promise.reject(new Error("DynamoDB exploded"));
            // Real DynamoDB rejects undefined values, so the fake does too.
            for (const [name, value] of Object.entries(command.input.Item ?? {})) {
              if (value === undefined) return Promise.reject(new Error(`undefined value for ${name}`));
            }
            putItems.push(command.input.Item);
            return Promise.resolve({});
          }

          return Promise.resolve({});
        })
      })
    }
  };
});

// --- Helpers -------------------------------------------------------------
const member = (sub: string) => ({ sub, "cognito:groups": "members" });
const admin  = (sub: string) => ({ sub, "cognito:groups": "admins" });

async function update(
  tableName: string,
  claims: Record<string, any>,
  pathParameters: Record<string, string>,
  body: any,
) {
  process.env.TABLE_NAME = tableName;
  return handler({
    requestContext: { authorizer: { claims } },
    pathParameters,
    body: typeof body === "string" ? body : JSON.stringify(body),
  } as any);
}

beforeEach(() => {
  putItems = [];
  failNextPut = false;
  jest.spyOn(console, 'error').mockImplementation(() => {}); // keep test output quiet
});

// --- Identity (401) ------------------------------------------------------
test('401 when there is no sub', async () => {
  const response = await update("Sessions", { sub: null }, { sessionId: "item_1" }, { focus: "x" });
  expect(response.statusCode).toBe(401);
  expect(putItems.length).toBe(0);
});

// --- Sessions: owner only. Someone else's session is simply not found ----
describe('Sessions', () => {
  test('owner updates own session (200)', async () => {
    const response = await update("Sessions", member("OWNER"), { sessionId: "item_1" }, { focus: "Legs" });
    expect(response.statusCode).toBe(200);
    expect(putItems[0].focus).toBe("Legs");
  });

  test('another user cannot update it (404, nothing written)', async () => {
    const response = await update("Sessions", member("OTHER"), { sessionId: "item_1" }, { focus: "hacked" });
    expect(response.statusCode).toBe(404);
    expect(putItems.length).toBe(0);
  });

  test('a userId in the body cannot move the session to someone else', async () => {
    await update("Sessions", member("OWNER"), { sessionId: "item_1" }, { userId: "VICTIM", focus: "x" });
    expect(putItems[0].userId).toBe("OWNER");
  });
});

// --- SessionExercises: owner only. Key has no user, so the handler checks ---
describe('SessionExercises', () => {
  test('owner updates own session exercise (200)', async () => {
    const response = await update("SessionExercises", member("OWNER"), { sessionExerciseId: "item_1" }, { sets: "5x5" });
    expect(response.statusCode).toBe(200);
  });

  test("another user cannot update it (403, nothing written)", async () => {
    const response = await update("SessionExercises", member("OTHER"), { sessionExerciseId: "item_1" }, { sets: "HACKED" });
    expect(response.statusCode).toBe(403);
    expect(putItems.length).toBe(0);
  });

  test("admin cannot update someone else's session exercise (403)", async () => {
    const response = await update("SessionExercises", admin("ADMIN_2"), { sessionExerciseId: "item_1" }, { sets: "x" });
    expect(response.statusCode).toBe(403);
    expect(putItems.length).toBe(0);
  });

  test('a userId in the body cannot change the owner', async () => {
    await update("SessionExercises", member("OWNER"), { sessionExerciseId: "item_1" }, { userId: "VICTIM", sets: "x" });
    expect(putItems[0].userId).toBe("OWNER");
  });

  test("a sessionId in the body cannot move it into another session (item 2.2)", async () => {
    await update("SessionExercises", member("OWNER"), { sessionExerciseId: "item_1" }, { sessionId: "VICTIM_SESSION", sets: "x" });
    expect(putItems[0].sessionId).toBe("SESSION_A");
  });
});

// --- Exercises: admin only, regardless of who created the exercise -------
describe('Exercises', () => {
  test('admin updates an exercise created by another admin (200)', async () => {
    const response = await update("Exercises", admin("ADMIN_2"), { exerciseId: "item_1" }, { name: "Curl" });
    expect(response.statusCode).toBe(200);
    expect(putItems[0].userId).toBe("SOME_ADMIN"); // creator is preserved, not overwritten
  });

  test('admin updates an exercise that has no userId (200)', async () => {
    const original = fakeTables.Exercises.item;
    fakeTables.Exercises.item = { exerciseId: "item_1" };
    try {
      const response = await update("Exercises", admin("ADMIN_2"), { exerciseId: "item_1" }, { name: "Curl" });
      expect(response.statusCode).toBe(200);
      expect("userId" in putItems[0]).toBe(false);
    } finally {
      fakeTables.Exercises.item = original; // put it back for the other tests
    }
  });

  test('member cannot update an exercise (403, nothing written)', async () => {
    const response = await update("Exercises", member("OWNER"), { exerciseId: "item_1" }, { name: "x" });
    expect(response.statusCode).toBe(403);
    expect(putItems.length).toBe(0);
  });

  test('spoofed custom:userType developer, with no group, cannot update (403)', async () => {
    const claims = { sub: "ATTACKER", "custom:userType": "developer" };
    const response = await update("Exercises", claims, { exerciseId: "item_1" }, { name: "x" });
    expect(response.statusCode).toBe(403);
    expect(putItems.length).toBe(0);
  });
});

// --- Bad input and failures ---------------------------------------------
describe('bad input and failures', () => {
  test('400 for invalid JSON', async () => {
    const response = await update("Sessions", member("OWNER"), { sessionId: "item_1" }, "not json");
    expect(response.statusCode).toBe(400);
    expect(putItems.length).toBe(0);
  });

  test('400 when the id in the path is missing', async () => {
    const response = await update("Sessions", member("OWNER"), {}, { focus: "x" });
    expect(response.statusCode).toBe(400);
  });

  test('500 when the database write fails', async () => {
    failNextPut = true;
    const response = await update("Sessions", member("OWNER"), { sessionId: "item_1" }, { focus: "x" });
    expect(response.statusCode).toBe(500);
  });
});
