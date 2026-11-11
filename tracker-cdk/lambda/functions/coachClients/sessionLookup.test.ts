import { handler as getExercises } from './getClientSessionExercises';
import { handler as createExercise } from './createSessionExerciseForClient';
import { findSessionById } from '../sessionLookup';

let mockSessionRows: any[] = [];
let mockPuts: any[] = [];
let mockQueries: any[] = [];

jest.mock('@aws-sdk/lib-dynamodb', () => {
  const actual = jest.requireActual('@aws-sdk/lib-dynamodb');
  const exerciseRows = [
    { sessionExerciseId: "se_client",  sessionId: "sess_1", userId: "CLIENT" },
    { sessionExerciseId: "se_planted", sessionId: "sess_1", userId: "ATTACKER" },
  ];
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: () => ({
        send: jest.fn((command) => {
          mockQueries.push(command.input);

          if (command instanceof actual.QueryCommand) {
            if (command.input.TableName === "Sessions") {
              const limit = command.input.Limit ?? 100;
              return Promise.resolve({ Items: mockSessionRows.slice(0, limit) });
            }
            // SessionExercises, sessionId-index: apply the owner filter like DynamoDB 
            const values = command.input.ExpressionAttributeValues ?? {};
            let items = exerciseRows.filter((r) => r.sessionId === values[":sid"]);
            if (command.input.FilterExpression === "userId = :owner") {
              items = items.filter((r) => r.userId === values[":owner"]);
            }
            return Promise.resolve({ Items: items });
          }

          if (command instanceof actual.GetCommand) {
            // the client's profile: coached by TRAINER
            return Promise.resolve({ Item: { userId: command.input.Key?.userId, currentTrainerId: "TRAINER" } });
          }

          if (command instanceof actual.PutCommand) {
            mockPuts.push(command.input);
            return Promise.resolve({});
          }
          return Promise.resolve({});
        })
      })
    }
  };
});

const trainer = { sub: "TRAINER", "cognito:groups": "trainers" };

const oneRow  = [{ sessionId: "sess_1", userId: "CLIENT" }];
const twoRows = [{ sessionId: "sess_1", userId: "ATTACKER" }, { sessionId: "sess_1", userId: "CLIENT" }];

beforeEach(() => {
  mockSessionRows = oneRow;
  mockPuts = [];
  mockQueries = [];
  process.env.SESSIONS_TABLE = "Sessions";
  process.env.USER_PROFILES_TABLE = "GtUserProfiles";
  process.env.SESSION_EXERCISES_TABLE = "SessionExercises";
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

const getEvent = () => ({
  requestContext: { authorizer: { claims: trainer } },
  pathParameters: { sessionId: "sess_1" },
} as any);

const createEvent = () => ({
  requestContext: { authorizer: { claims: trainer } },
  pathParameters: { sessionId: "sess_1" },
  body: JSON.stringify({ exerciseId: "bench", exerciseIndex: 1, toFailure: false, sets: "0x0" }),
} as any);

describe('findSessionById', () => {
  const client = { send: jest.fn() } as any;

  test('found: exactly one row', async () => {
    client.send.mockResolvedValueOnce({ Items: oneRow });
    expect(await findSessionById(client, "Sessions", "sess_1")).toEqual({ status: "found", session: oneRow[0] });
  });

  test('notFound: no rows', async () => {
    client.send.mockResolvedValueOnce({ Items: [] });
    expect(await findSessionById(client, "Sessions", "sess_1")).toEqual({ status: "notFound" });
  });

  test('ambiguous: two rows share the id', async () => {
    client.send.mockResolvedValueOnce({ Items: twoRows });
    expect(await findSessionById(client, "Sessions", "sess_1")).toEqual({ status: "ambiguous" });
  });

  test('asks DynamoDB for two rows so a duplicate can be seen (Limit 2, not 1)', async () => {
    client.send.mockResolvedValueOnce({ Items: oneRow });
    await findSessionById(client, "Sessions", "sess_1");
    expect(client.send.mock.calls.at(-1)[0].input.Limit).toBe(2);
  });
});

describe('getClientSessionExercises', () => {
  test('returns only rows owned by the session owner (planted rows are hidden)', async () => {
    const response = await getExercises(getEvent());
    expect(response.statusCode).toBe(200);
    const ids = JSON.parse(response.body).map((r: any) => r.sessionExerciseId);
    expect(ids).toEqual(["se_client"]);
  });

  test('409 when two session rows share the id', async () => {
    mockSessionRows = twoRows;
    const response = await getExercises(getEvent());
    expect(response.statusCode).toBe(409);
  });
});

describe('createSessionExerciseForClient', () => {
  test('200 for a normal session', async () => {
    const response = await createExercise(createEvent());
    expect(response.statusCode).toBe(200);
    expect(mockPuts[0].Item.userId).toBe("CLIENT");
  });

  test('409 and nothing written when two session rows share the id', async () => {
    mockSessionRows = twoRows;
    const response = await createExercise(createEvent());
    expect(response.statusCode).toBe(409);
    expect(mockPuts.length).toBe(0);
  });
});
