import { handler } from './delete';

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
  body: JSON.stringify({ someField: "value" })
};

jest.mock('@aws-sdk/lib-dynamodb', () =>{
  const actual = jest.requireActual('@aws-sdk/lib-dynamodb');
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: () => ({
        send: jest.fn((command) =>{
          if(command instanceof actual.GetCommand){
            const key = command.input.Key?.PK;
            if (key === "nonexistent_item") {
              return Promise.resolve({Item: undefined})
            }
            return Promise.resolve({ Item: fakeExistingItem });
          }
          if(command instanceof actual.DeleteCommand){
            return Promise.resolve({});
          }
          return Promise.resolve({}); // here to stop crash
        })
      })
    }
  }
})

test(`Rejects if caller doesnt own the item`, async () => {
  const response = await handler(fakeEvent as any);
  expect(response.statusCode).toBe(403);
});

test('Allows delete if caller owns the item', async () =>{
  const legitDelEvent = {
    queryStringParameters: { PK: "item_1" },
    requestContext: {
      authorizer: {
        claims: {
          sub: "TEST_USER"
        }
      }
    },
  }

  const response = await handler(legitDelEvent as any);
  expect(response.statusCode).toBe(200);
})

test(`Throws 400 for missing pk`, async () => {
  const response = await handler({
    queryStringParameters: null,
    requestContext: {authorizer: {claims: {sub: "TEST_USER"}}},
  } as any)

  expect(response.statusCode).toBe(400);
});

test(`returns 401 if user isnt authenticated`, async ()=>{
  const response = await handler({
    queryStringParameters: { PK: "item_1" },
    requestContext: { authorizer: { claims: { sub: null } } },
  } as any);

  expect(response.statusCode).toBe(401)
})

test('returns 404 when item does not exist', async () => {
  const response = await handler({
    queryStringParameters: { PK: "nonexistent_item" },
    requestContext: { authorizer: { claims: { sub: "TEST_USER" } } },
  } as any);
  expect(response.statusCode).toBe(404);
});