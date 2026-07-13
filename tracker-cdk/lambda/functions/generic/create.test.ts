import { handler } from './create';

const fakeSession = { sessionId: "item_1", userId: "TEST_USER", body: "New Data" };
const fakeExercise = { exerciseId: "item_1", userId: "TEST_USER", body: "New Data"  };
const fakeSessionExercise = { sessionExerciseId: "item_1", userId: "TEST_USER", body: "New Data"  }; // owner tracked in data, not in key

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
          if(!table)return Promise.resolve({});
          if(!table.idField)return Promise.resolve({});
          if(!table.item)return Promise.resolve({});
          
          if (command instanceof actual.PutCommand) {
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
])("create handler — $tableName", ({ tableName }) => {
  beforeEach(() => {
    process.env.TABLE_NAME = tableName;
  });
  
  test('Allows create is authed (200)', async () => {
    const response = await handler({
      requestContext: { authorizer: { claims: { sub: "TEST_USER" } } },
      body: JSON.stringify({ someField: "New value" }),
    } as any);
    expect(response.statusCode).toBe(200);
  });

  test('Fails for missing Body (400)', async () => {
    const response = await handler({
      requestContext: { authorizer: { claims: { sub: "TEST_USER" } } },
    } as any);
    expect(response.statusCode).toBe(400);
  });

  test('Throws 401 Failed to authentication', async () => {
    const response = await handler({
      requestContext: { authorizer: { claims: { sub: null } } },
      body: JSON.stringify({ someField: "New value" }),
    } as any);
    expect(response.statusCode).toBe(401);
  });

  test('Fails for invalid JSON body (400)', async () => {
    const response = await handler({
      requestContext: { authorizer: { claims: { sub: "TEST_USER" } } },
      body: "{not valid json",
    } as any);
    expect(response.statusCode).toBe(400);
  });
});
