import { handler } from './getBySession';

process.env.TABLE_NAME = "SessionExercises";
process.env.OTHER_TABLE = "Sessions";
jest.mock('@aws-sdk/lib-dynamodb', () =>{
  const actual = jest.requireActual('@aws-sdk/lib-dynamodb');
  return {
    ...actual,
    DynamoDBDocumentClient: {  
      from: () => ({
        send: jest.fn((command) =>{
        if (command.input.TableName === "SessionExercises") {
          return Promise.resolve({ Items: [{ sessionExerciseId: "se_1", sessionId: "sess_1" }] });
        }
        if (command.input.TableName === "Sessions") {
          return Promise.resolve({ Items: [{ sessionId: "sess_1", userId: "TEST_USER" }] });
        }
        return Promise.resolve({ Items: [] });
      })
    }
  )}}
})

test('returns 200 when authenticated caller owns the session', async () => {
  const response = await handler({
    queryStringParameters: { sessionId: "sess_1" },
    requestContext: {
      authorizer: {
        claims: {
          sub: "TEST_USER"
        }
      }
    },
  } as any);
  expect(response.statusCode).toBe(200);
});

test('returns 400 for missing sessionId', async () => {
  const response = await handler({
    requestContext: {
      authorizer: {
        claims: {
          sub: "TEST_USER"
        }
      }
    },
  } as any);
  expect(response.statusCode).toBe(400);
});

test('returns 401 when caller is not authenticated', async () => {
  const response = await handler({
    queryStringParameters: { sessionId: "sess_1" },
    requestContext: { authorizer: { claims: { sub: null }}},
  } as any);
  expect(response.statusCode).toBe(401);
});

test('returns 403 when caller does not own session', async () => {
  const response = await handler({
    queryStringParameters: { sessionId: "sess_1" },
    requestContext: {
      authorizer: {
        claims: {
          sub: "FAKE_USER"
        }
      }
    },
  } as any);
  expect(response.statusCode).toBe(403);
});