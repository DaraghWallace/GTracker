import { handler } from './create';

jest.mock('@aws-sdk/lib-dynamodb', () =>{
  const actual = jest.requireActual('@aws-sdk/lib-dynamodb');
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: () => ({
        send: jest.fn((command) =>{
          if(command instanceof actual.PutCommand){
            return Promise.resolve({});
          }            
          return Promise.resolve({}); // here to stop crash
        })
      })
    }
  }
})

test(`returns 200 if create works`, async ()=>{
  const response = await handler({
    queryStringParameters: null,
    requestContext: { authorizer: { claims: { sub: "TEST_USER" } } },
    body: JSON.stringify({ someField: "value" })
  } as any);
  expect(response.statusCode).toBe(200)
})

test(`returns 400 if Body is missing`, async ()=>{
  const response = await handler({
    queryStringParameters: null,
    requestContext: { authorizer: { claims: { sub: "TEST_USER" } } },
  } as any);
  expect(response.statusCode).toBe(400)
})

test('returns 400 if JSON is invalid', async () => {
  const response = await handler({
    queryStringParameters: null,
    requestContext: { authorizer: { claims: { sub: "TEST_USER" } } },
    body: "{{broken json"
  } as any);
  expect(response.statusCode).toBe(400);
});

test(`returns 401 if user isnt authenticated`, async ()=>{
  const response = await handler({
    queryStringParameters: { PK: "item_1" },
    requestContext: { authorizer: { claims: { sub: null } } },
  } as any);

  expect(response.statusCode).toBe(401)
})


