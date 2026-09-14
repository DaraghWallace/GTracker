import { handler } from './getItem';

const fakeItem = { userId: "item_1", currentTrainerId: "TRAINER_1", name: "Test User" };

jest.mock('@aws-sdk/lib-dynamodb', () => {
  const actual = jest.requireActual('@aws-sdk/lib-dynamodb');
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: () => ({
        send: jest.fn((command) => {
          if (command instanceof actual.GetCommand) {
            const key = command.input.Key ?? {};
            if (key.userId === "item_1") return Promise.resolve({ Item: fakeItem });
            return Promise.resolve({ Item: undefined });
          }
          return Promise.resolve({});
        })
      })
    }
  };
});

describe('getItem handler', () => {
  beforeEach(() => {
    process.env.TABLE_NAME = "UserProfiles";
    process.env.PARTITION_KEY_NAME = "userId";
    process.env.OWNERSHIP_FIELD = "userId";
    process.env.IS_PUBLIC = "false";
  });

  test('returns 401 if unauthenticated', async () => {
    const response = await handler({
      pathParameters: { id: "item_1" },
      requestContext: { authorizer: { claims: { sub: null } } },
    } as any);
    expect(response.statusCode).toBe(401);
  });

  test('returns 400 if id missing', async () => {
    const response = await handler({
      pathParameters: null,
      requestContext: { authorizer: { claims: { sub: "TEST_USER" } } },
    } as any);
    expect(response.statusCode).toBe(400);
  });

  test('returns 404 if item does not exist', async () => {
    const response = await handler({
      pathParameters: { id: "nonexistent" },
      requestContext: { authorizer: { claims: { sub: "TEST_USER" } } },
    } as any);
    expect(response.statusCode).toBe(404);
  });

  test('returns 200 if caller owns the item', async () => {
    const response = await handler({
      pathParameters: { id: "item_1" },
      requestContext: { authorizer: { claims: { sub: "item_1" } } },
    } as any);
    expect(response.statusCode).toBe(200);
  });

  test('returns 403 if caller does not own, table not public, not developer', async () => {
    const response = await handler({
      pathParameters: { id: "item_1" },
      requestContext: { authorizer: { claims: { sub: "SOMEONE_ELSE" } } },
    } as any);
    expect(response.statusCode).toBe(403);
  });

  test('returns 200 regardless of ownership if table is public', async () => {
    process.env.IS_PUBLIC = "true";
    const response = await handler({
      pathParameters: { id: "item_1" },
      requestContext: { authorizer: { claims: { sub: "SOMEONE_ELSE" } } },
    } as any);
    expect(response.statusCode).toBe(200);
  });

  test('returns 200 regardless of ownership if caller is a developer', async () => {
    const response = await handler({
      pathParameters: { id: "item_1" },
      requestContext: { authorizer: { claims: { sub: "SOMEONE_ELSE", "custom:userType": "developer" } } },
    } as any);
    expect(response.statusCode).toBe(200);
  });
});