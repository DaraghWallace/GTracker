import { handler } from './listClients';

const fakeClients = [
  { userId: "CLIENT_1", currentTrainerId: "TRAINER_1", nickname: "Bob" },
  { userId: "CLIENT_2", currentTrainerId: "TRAINER_1", nickname: "Alice" },
];

jest.mock('@aws-sdk/lib-dynamodb', () => {
  const actual = jest.requireActual('@aws-sdk/lib-dynamodb');
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: () => ({
        send: jest.fn((command) => {
          if (command instanceof actual.QueryCommand) {
            const trainerId = command.input.ExpressionAttributeValues?.[":trainerId"];
            const items = fakeClients.filter(c => c.currentTrainerId === trainerId);
            return Promise.resolve({ Items: items });
          }
          return Promise.resolve({});
        })
      })
    }
  };
});

describe('listClients handler', () => {
  beforeEach(() => {
    process.env.TABLE_NAME = "UserProfiles";
  });

  test('returns 401 if unauthenticated', async () => {
    const response = await handler({
      requestContext: { authorizer: { claims: { sub: null } } },
    } as any);
    expect(response.statusCode).toBe(401);
  });

  test('returns 200 with the caller\'s clients', async () => {
    const response = await handler({
      requestContext: { authorizer: { claims: { sub: "TRAINER_1" } } },
    } as any);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toHaveLength(2);
  });

  test('returns 200 with empty array if trainer has no clients', async () => {
    const response = await handler({
      requestContext: { authorizer: { claims: { sub: "TRAINER_WITH_NONE" } } },
    } as any);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual([]);
  });
});