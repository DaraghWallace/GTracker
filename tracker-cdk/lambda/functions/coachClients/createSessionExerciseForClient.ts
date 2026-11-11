import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";
import { randomUUID } from "crypto";
import { isInGroup } from "../auth";
import { findSessionById } from "../sessionLookup";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

export const handler = async (event: APIGatewayProxyEvent) => {
  const claims = event.requestContext.authorizer?.claims;
  const trainerId = claims?.sub;
  if (!trainerId) {
    return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  const isTrainer = isInGroup(claims, "trainers") || isInGroup(claims, "admins");
  if (!isTrainer) {
    return { statusCode: 403, headers: CORS_HEADERS, body: JSON.stringify({ error: "Not a trainer" }) };
  }

  const sessionId = event.pathParameters?.sessionId;
  if (!sessionId) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "sessionId required" }) };
  }

  let body: Record<string, any>;
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  // Validate the fields we accept. Wrong or missing types are the caller's fault (400).
  const validBody =
    body !== null && typeof body === "object" &&
    typeof body.exerciseId === "string" && body.exerciseId.length > 0 && body.exerciseId.length <= 64 &&
    Number.isInteger(body.exerciseIndex) && body.exerciseIndex >= 0 && body.exerciseIndex <= 100 &&
    typeof body.toFailure === "boolean" &&
    typeof body.sets === "string" && body.sets.length <= 200;
  if (!validBody) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Invalid exercise fields" }) };
  }

  try {
    const lookup = await findSessionById(docClient, process.env.SESSIONS_TABLE!, sessionId);
    if (lookup.status === "notFound") {
      return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ error: "Session not found" }) };
    }
    if (lookup.status === "ambiguous") {
      // Two rows share this sessionId (item 2.12). Refuse rather than guess whose it is.
      console.error("Duplicate sessionId in Sessions table:", sessionId);
      return { statusCode: 409, headers: CORS_HEADERS, body: JSON.stringify({ error: "Session id is not unique" }) };
    }
    const session = lookup.session;

    const profile = await docClient.send(new GetCommand({
      TableName: process.env.USER_PROFILES_TABLE!,
      Key: { userId: session.userId },
    }));

    if (profile.Item?.currentTrainerId !== trainerId) {
      return { statusCode: 403, headers: CORS_HEADERS, body: JSON.stringify({ error: "Not your client's session" }) };
    }

    // Allow-list: only these fields are copied from the request. Anything else is dropped.
    // The ids and owner always come from the server, never from the body.
    const newItem = {
      exerciseId: body.exerciseId,
      exerciseIndex: body.exerciseIndex,
      toFailure: body.toFailure,
      sets: body.sets,
      sessionExerciseId: randomUUID(),
      sessionId,
      userId: session.userId,
      createdBy: trainerId,
    };

    await docClient.send(new PutCommand({
      TableName: process.env.SESSION_EXERCISES_TABLE!,
      Item: newItem,
    }));

    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(newItem) };
  } catch (error) {
    console.error("createSessionExerciseForClient failed:", error);
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: "Internal server error" }) };
  }
};
