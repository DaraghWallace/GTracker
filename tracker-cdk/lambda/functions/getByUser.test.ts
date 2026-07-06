import { handler } from './getByUser';


jest.mock('@aws-sdk/lib-dynamodb', () =>{
  const actual = jest.requireActual('@aws-sdk/lib-dynamodb');
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: () => ({
        send: jest.fn((command) =>{
          if (command instanceof actual.QueryCommand) {
            return Promise.resolve({ Items: [] });
          }            
          return Promise.resolve({});
      })
    })}
  }
})

test('returns 200 and items when authenticated', async () => {
  const legitimateEvent = {
    requestContext: {
      authorizer: {
        claims: {
          sub: "TEST_USER" // same as fakeExistingItem.userId
        }
      }
    },
  };

  const response = await handler(legitimateEvent as any);
  expect(response.statusCode).toBe(200);
});

test('returns 401 when caller is not authenticated', async () => {
  const response = await handler({
    requestContext: { authorizer: { claims: { sub: null } } },
  } as any);
  expect(response.statusCode).toBe(401);
});