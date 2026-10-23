import { handler } from './addClient';

jest.mock('@aws-sdk/lib-dynamodb', () => {
  const actual = jest.requireActual('@aws-sdk/lib-dynamodb');
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: () => ({
        send: jest.fn((command) => {
          if (command instanceof actual.UpdateCommand) {
            const clientId = command.input.Key?.userId;
            if (clientId === "ALREADY_COACHED") {
              const err: any = new Error("Conditional check failed");
              err.name = "ConditionalCheckFailedException";
              return Promise.reject(err);
            }if (clientId === "ALREADY_COACHED") {
              return Promise.resolve({});
            }
            return Promise.resolve({});
          }
          return Promise.resolve({});
        })
      })
    }
  };
});

describe('addClient handler', () => {
  beforeEach(() => {
    process.env.USER_PROFILES_TABLE = "UserProfiles";
  });

  test('returns 401 if unauthenticated', async () => {
    const response = await handler({
      requestContext: { authorizer: { claims: { sub: null } } },
      body: JSON.stringify({ clientId: "CLIENT_1" }),
    } as any);
    expect(response.statusCode).toBe(401);
  });

  test('returns 400 if clientId missing', async () => {
    const response = await handler({
      requestContext: { authorizer: { claims: { sub: "TRAINER_1" } } },
      body: JSON.stringify({}),
    } as any);
    expect(response.statusCode).toBe(400);
  });

  test('returns 403 if caller is not a trainer', async () => {
    const response = await handler({
      requestContext: { authorizer: { claims: { sub: "TRAINER_1", "cognito:groups": "members" } } },
      body: JSON.stringify({ clientId: "CLIENT_1" }),
    } as any);
    expect(response.statusCode).toBe(403);
  });

  test('returns 200 on successful assignment (trainers)', async () => {
    const response = await handler({
      requestContext: { authorizer: { claims: { sub: "TRAINER_1", "cognito:groups": "trainers" } } },
      body: JSON.stringify({ clientId: "CLIENT_1" }),
    } as any);
    expect(response.statusCode).toBe(200);
  });

  test('returns 200 with only userId and nickname on match (Admin)', async () => {
    const response = await handler({
      requestContext: { authorizer: { claims: { sub: "TRAINER_1", "cognito:groups": "admins" } } },
      body: JSON.stringify({ clientId: "CLIENT_1" }),
    } as any);
    expect(response.statusCode).toBe(200);
  });
  

  test('returns 409 if client already has a coach', async () => {
    const response = await handler({
      requestContext: { authorizer: { claims: { sub: "TRAINER_1", "cognito:groups": "trainers" } } },
      body: JSON.stringify({ clientId: "ALREADY_COACHED" }),
    } as any);
    expect(response.statusCode).toBe(409);
  });

  test('returns 200 when coach is added', async () => {
    const response = await handler({
      requestContext: { authorizer: { claims: { sub: "TRAINER_1", "cognito:groups": "trainers" } } },
      body: JSON.stringify({ clientId: "NEEDS_COACHING" }),
    } as any);
    expect(response.statusCode).toBe(200);
  });

  test('returns 403 wrong group (members)', async () => {
    const response = await handler({
      requestContext: { authorizer: { claims: { sub: "MEMBER_1", "cognito:groups": "members" } } },
      body: JSON.stringify({ clientId: "MEMBER_1" }),
    } as any);
    expect(response.statusCode).toBe(403);
  });

  test('returns 403 wrong usertype (developer)', async () => {
    const response = await handler({
      requestContext: { authorizer: { claims: { sub: "TRAINER_1", "custom:userType": "developer" } } },
      body: JSON.stringify({ clientId: "CLIENT_1" }),
    } as any);
    expect(response.statusCode).toBe(403);
  });
});