import { handler } from './updateItem';

const fakeExistingItem  = {userId: "TEST_USER"}
const fakeEvent = {
  queryStringParameters: { PK: "item_1" },
  requestContext: {
    authorizer: {
      claims: {
        sub: "ATTACKER_USER"
      }
    }
  },
  body: JSON.stringify({ someField: "updated value" })
};

jest.mock('@aws-sdk/lib-dynamodb', () => {
  const actual = jest.requireActual('@aws-sdk/lib-dynamodb');
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: () => ({
        send: jest.fn((command) => {
          if (command instanceof actual.GetCommand) {
            const key = command.input.Key?.PK;
            if (key === "nonexistent_item") {
              return Promise.resolve({ Item: undefined });
            }
            return Promise.resolve({ Item: fakeExistingItem });
          }
          if (command instanceof actual.PutCommand) {
            return Promise.resolve({});
          }
          return Promise.resolve({}); // here to stop crash
        })
      })
    }
  };
});

test('rejects update when caller does not own the item (403)', async () => {
  const response = await handler(fakeEvent as any);
  expect(response.statusCode).toBe(403);
});

test('allows update when caller owns the item (200)', async () => {
  const legitimateEvent = {
    queryStringParameters: { PK: "item_1" },
    requestContext: {
      authorizer: {
        claims: {
          sub: "TEST_USER" // same as fakeExistingItem.userId
        }
      }
    },
    body: JSON.stringify({ someField: "updated value" })
  };

  const response = await handler(legitimateEvent as any);
  expect(response.statusCode).toBe(200);
});

test('returns 400 when PK is missing', async () => {
  const response = await handler({
    queryStringParameters: null,
    requestContext: { authorizer: { claims: { sub: "TEST_USER" } } },
    body: JSON.stringify({ someField: "value" })
  } as any);
  expect(response.statusCode).toBe(400);
});

test('returns 401 when caller is not authenticated', async () => {
  const response = await handler({
    queryStringParameters: { PK: "item_1" },
    requestContext: { authorizer: { claims: { sub: null } } },
    body: JSON.stringify({ someField: "value" })
  } as any);
  expect(response.statusCode).toBe(401);
});

test('returns 404 when item does not exist', async () => {
  const response = await handler({
    queryStringParameters: { PK: "nonexistent_item" },
    requestContext: { authorizer: { claims: { sub: "TEST_USER" } } },
    body: JSON.stringify({ someField: "value" })
  } as any);
  expect(response.statusCode).toBe(404);
});