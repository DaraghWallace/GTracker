import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

// The frontend makes the id with crypto.randomUUID(), so only that shape is accepted.
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const reply = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: CORS_HEADERS,
  body: JSON.stringify(body),
});

// Creates one SessionExercise for the CALLER's own session.
// Security items 2.1 (overwriting another user's row) and 2.2 (attaching to another user's session).
export const handler = async (event: APIGatewayProxyEvent) => {
  // Read the table names inside the handler so tests can change them.
  const sessionsTable = process.env.SESSIONS_TABLE!;
  const sessionExercisesTable = process.env.SESSION_EXERCISES_TABLE!;

  // Gate 1: who are you? (401)
  const callerSub = event.requestContext.authorizer?.claims?.sub;
  if (!callerSub) {
    return reply(401, { error: "Unauthorized" });
  }

  // Gate 2: is the body valid JSON? (400)
  let body: Record<string, any>;
  try {
    body = JSON.parse(event.body ?? "");
  } catch {
    return reply(400, { error: "Invalid JSON in request body" });
  }

  // Gate 3: are the fields the right shape? (400). Anything not listed here is never copied.
  const validBody =
    body !== null && typeof body === "object" &&
    typeof body.sessionExerciseId === "string" && UUID_PATTERN.test(body.sessionExerciseId) &&
    typeof body.sessionId === "string" && body.sessionId.length > 0 && body.sessionId.length <= 64 &&
    typeof body.exerciseId === "string" && body.exerciseId.length > 0 && body.exerciseId.length <= 64 &&
    Number.isInteger(body.exerciseIndex) && body.exerciseIndex >= 0 && body.exerciseIndex <= 100 &&
    typeof body.toFailure === "boolean" &&
    typeof body.sets === "string" && body.sets.length <= 200;
  if (!validBody) {
    return reply(400, { error: "Invalid session exercise fields" });
  }

  try {
    // Gate 4: is this YOUR session? (404)
    // The Sessions key includes userId, so a session belonging to someone else is simply not found.
    const session = await docClient.send(new GetCommand({
      TableName: sessionsTable,
      Key: { sessionId: body.sessionId, userId: callerSub },
    }));
    if (!session.Item) {
      return reply(404, { error: "Session not found" });
    }

    // The write. Only allow-listed fields are copied, and the owner comes from the token.
    // The condition makes DynamoDB refuse to replace a row that already exists.
    const newItem = {
      sessionExerciseId: body.sessionExerciseId,
      sessionId: body.sessionId,
      exerciseId: body.exerciseId,
      exerciseIndex: body.exerciseIndex,
      toFailure: body.toFailure,
      sets: body.sets,
      userId: callerSub,
    };

    await docClient.send(new PutCommand({
      TableName: sessionExercisesTable,
      Item: newItem,
      ConditionExpression: "attribute_not_exists(sessionExerciseId)",
    }));

    return reply(200, { message: `Sent to ${sessionExercisesTable}` });
  } catch (error: any) {
    // Gate 5: that id is already taken (409). Nothing was changed.
    if (error?.name === "ConditionalCheckFailedException") {
      return reply(409, { error: "Session exercise already exists" });
    }
    console.error("createSessionExercise failed:", error);
    return reply(500, { error: "Failed to create" });
  }
};
