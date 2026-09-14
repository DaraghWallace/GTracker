import { handler } from './findByEmail';

const fakeUser = { userId: "CLIENT_1", email: "client@test.com", nickname: "Bob" };

jest.mock('@aws-sdk/lib-dynamodb', () => {
  const actual = jest.requireActual('@aws-sdk/lib-dynamodb');
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: () => ({
        send: jest.fn((command) => {
          if (command instanceof actual.ScanCommand) {
            const email = command.input.ExpressionAttributeValues?.[":email"];
            if (email === fakeUser.email) return Promise.resolve({ Items: [fakeUser] });
            return Promise.resolve({ Items: [] });
          }
          return Promise.resolve({});
        })
      })
    }
  };
});

describe('findByEmail handler', () => {
  beforeEach(() => {
    process.env.TABLE_NAME = "UserProfiles";
  });

  test('returns 401 if unauthenticated', async () => {
    const response = await handler({
      queryStringParameters: { email: "client@test.com" },
      requestContext: { authorizer: { claims: { sub: null } } },
    } as any);
    expect(response.statusCode).toBe(401);
  });

  test('returns 403 if caller is not a trainer', async () => {
    const response = await handler({
      queryStringParameters: { email: "client@test.com" },
      requestContext: { authorizer: { claims: { sub: "TRAINER_1", "cognito:groups": "members" } } },
    } as any);
    expect(response.statusCode).toBe(403);
  });

  test('returns 400 if email missing', async () => {
    const response = await handler({
      queryStringParameters: null,
      requestContext: { authorizer: { claims: { sub: "TRAINER_1", "cognito:groups": "trainers" } } },
    } as any);
    expect(response.statusCode).toBe(400);
  });

  test('returns 404 if no user matches', async () => {
    const response = await handler({
      queryStringParameters: { email: "nobody@test.com" },
      requestContext: { authorizer: { claims: { sub: "TRAINER_1", "cognito:groups": "trainers" } } },
    } as any);
    expect(response.statusCode).toBe(404);
  });

  test('returns 200 with only userId and nickname on match', async () => {
    const response = await handler({
      queryStringParameters: { email: "client@test.com" },
      requestContext: { authorizer: { claims: { sub: "TRAINER_1", "cognito:groups": "trainers" } } },
    } as any);
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toEqual({ userId: "CLIENT_1", nickname: "Bob" });
    expect(body.email).toBeUndefined(); // shouldn't leak email back
  });
});