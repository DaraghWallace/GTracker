// Role-gate tests shared by every trainer-only handler.
// Each handler must: 401 with no sub, 403 for members, 403 for a spoofed custom:userType,
// and let trainers AND admins past the gate (anything that isn't 401/403).
jest.mock('@aws-sdk/lib-dynamodb', () => {
  const actual = jest.requireActual('@aws-sdk/lib-dynamodb');
  return {
    ...actual,
    DynamoDBDocumentClient: { from: () => ({ send: jest.fn(() => Promise.resolve({ Items: [], Item: undefined })) }) },
  };
});

import { handler as addClient } from './addClient';
import { handler as removeClient } from './removeClient';
import { handler as findByEmail } from './findByEmail';
import { handler as listClients } from './listClients';
import { handler as latestSession } from './getClientLatestSession';
import { handler as sessionExercises } from './getClientSessionExercises';
import { handler as createSE } from './createSessionExerciseForClient';

const handlers: [string, (e: any) => Promise<any>, Record<string, any>][] = [
  ["addClient",                       addClient,        { body: JSON.stringify({ clientId: "C1" }) }],
  ["removeClient",                    removeClient,     { body: JSON.stringify({ clientId: "C1" }) }],
  ["findByEmail",                     findByEmail,      { queryStringParameters: { email: "a@b.c" } }],
  ["listClients",                     listClients,      {}],
  ["getClientLatestSession",          latestSession,    { pathParameters: { clientId: "C1" } }],
  ["getClientSessionExercises",       sessionExercises, { pathParameters: { sessionId: "S1" } }],
  ["createSessionExerciseForClient",  createSE,         { pathParameters: { sessionId: "S1" },
      body: JSON.stringify({ exerciseId: "E1", exerciseIndex: 0, toFailure: false, sets: "5x5" }) }],
];

const call = (h: (e: any) => Promise<any>, claims: any, extra: Record<string, any>) =>
  h({ requestContext: { authorizer: { claims } }, ...extra });

beforeEach(() => {
  process.env.TABLE_NAME = "T";
  process.env.USER_PROFILES_TABLE = "P";
  process.env.SESSIONS_TABLE = "S";
  process.env.SESSION_EXERCISES_TABLE = "SE";
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe.each(handlers)('%s role gate', (_name, h, extra) => {
  test('401 with no sub', async () => {
    expect((await call(h, { sub: null }, extra)).statusCode).toBe(401);
  });
  test('403 for a member', async () => {
    expect((await call(h, { sub: "U", "cognito:groups": "members" }, extra)).statusCode).toBe(403);
  });
  test('403 for spoofed custom:userType developer with no group', async () => {
    expect((await call(h, { sub: "U", "custom:userType": "developer" }, extra)).statusCode).toBe(403);
  });
  test('403 for a lookalike group name', async () => {
    expect((await call(h, { sub: "U", "cognito:groups": "trainers-fake" }, extra)).statusCode).toBe(403);
  });
  // A later check (e.g. "Not your client") may still return 403, so look for the role-gate message itself.
  test('trainer gets past the role gate', async () => {
    const r = await call(h, { sub: "T1", "cognito:groups": "trainers" }, extra);
    expect(r.statusCode).not.toBe(401);
    expect(JSON.parse(r.body)?.error).not.toBe("Not a trainer");
  });
  test('admin gets past the role gate', async () => {
    const r = await call(h, { sub: "A1", "cognito:groups": "admins" }, extra);
    expect(r.statusCode).not.toBe(401);
    expect(JSON.parse(r.body)?.error).not.toBe("Not a trainer");
  });
});
