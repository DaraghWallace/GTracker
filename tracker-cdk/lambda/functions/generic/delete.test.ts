import { handler } from './delete';

const fakeSession = { sessionId: "item_1", userId: "TEST_USER" };
const fakeExercise = { exerciseId: "item_1", userId: "TEST_USER" };
const fakeSessionExercise = { sessionExerciseId: "item_1", userId: "TEST_USER" }; // owner tracked in data, not in key

// One in-memory "table" per TABLE_NAME, keyed by id field name.
const fakeTables: Record<string, { idField: string; item: Record<string, any> }> = {
  Sessions: { idField: "sessionId", item: fakeSession },
  Exercises: { idField: "exerciseId", item: fakeExercise },
  SessionExercises: { idField: "sessionExerciseId", item: fakeSessionExercise },
};

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

            const keyHasUserId = "userId" in requestedKey; // Sessions/Exercises
            const userMatches = keyHasUserId ? requestedKey.userId === table.item.userId : true; // SessionExercises

            if (idMatches && userMatches) {
              return Promise.resolve({ Item: table.item });
            }
            return Promise.resolve({ Item: undefined });
          }

          if (command instanceof actual.DeleteCommand) {
            return Promise.resolve({});
          }

          return Promise.resolve({});
        })
      })
    }
  };
});

describe.each([
  { tableName: "Sessions", idParam: "sessionId", ownerRejectStatus: 404 },
  { tableName: "Exercises", idParam: "exerciseId", ownerRejectStatus: 404 },
  { tableName: "SessionExercises", idParam: "sessionExerciseId", ownerRejectStatus: 403 },
])("delete handler — $tableName", ({ tableName, idParam, ownerRejectStatus }) => {
  beforeEach(() => {
    process.env.TABLE_NAME = tableName;
  });

  test(`Rejects if caller doesn't own the item`, async () => {
    const response = await handler({
      pathParameters: { [idParam]: "item_1" },
      requestContext: { authorizer: { claims: { sub: "ATTACKER_USER" } } },
    } as any);
    expect(response.statusCode).toBe(ownerRejectStatus);      
  });

  test('Allows delete if caller owns the item (200)', async () => {
    const response = await handler({
      pathParameters: { [idParam]: "item_1" },
      requestContext: { authorizer: { claims: { sub: "TEST_USER" } } },
    } as any);
    expect(response.statusCode).toBe(200);
  });

  test(`Throws 400 for missing id`, async () => {
    const response = await handler({
      pathParameters: null,
      requestContext: { authorizer: { claims: { sub: "TEST_USER" } } },
    } as any);
    expect(response.statusCode).toBe(400);
  });

  test(`returns 401 if user isn't authenticated`, async () => {
    const response = await handler({
      pathParameters: { [idParam]: "item_1" },
      requestContext: { authorizer: { claims: { sub: null } } },
    } as any);
    expect(response.statusCode).toBe(401);
  });

  test('returns 404 when item does not exist', async () => {
    const response = await handler({
      pathParameters: { [idParam]: "nonexistent_item" },
      requestContext: { authorizer: { claims: { sub: "TEST_USER" } } },
    } as any);
    expect(response.statusCode).toBe(404);
  });
});