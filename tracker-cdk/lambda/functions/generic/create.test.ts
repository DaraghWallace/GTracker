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
  { tableName: "Sessions",         groups: "members" },
  { tableName: "Exercises",        groups: "admins"  },
  { tableName: "SessionExercises", groups: "members" },
])("create handler — $tableName", ({ tableName, groups }) => {
  beforeEach(() => {
    process.env.TABLE_NAME = tableName;
  });

  const claims = { sub: "TEST_USER", "cognito:groups": groups };

  test('Allows create if allowed caller (200)', async () => {
    const response = await handler({
      requestContext: { authorizer: { claims } },
      body: JSON.stringify({ someField: "New value" }),
    } as any);
    expect(response.statusCode).toBe(200);
  });

  test('Fails for missing Body (400)', async () => {
    const response = await handler({
      requestContext: { authorizer: { claims } },
    } as any);
    expect(response.statusCode).toBe(400);
  });  

  if (tableName === "Exercises"){
    test('Fails for wrong group (members) (401)', async () => {
      const response = await handler({
        requestContext: { authorizer: { sub: "TEST_USER", "cognito:groups": "members"  } },
      } as any);
      expect(response.statusCode).toBe(401);
    }); 
  
    test('Spoofed  usertype fails (developer) (401)', async () => {
      const response = await handler({
        requestContext: { authorizer: { sub: "TEST_USER", "cognito:userType": "developer"  } },
      } as any);
      expect(response.statusCode).toBe(401);
    }); 
  }
});
