import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";
import { isInGroup } from "../auth";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

export const handler = async (event: APIGatewayProxyEvent) => {
  const tableName = process.env.TABLE_NAME!;
  const claims = event.requestContext.authorizer?.claims;

  const callerSub = claims?.sub;
  const isAdmin = isInGroup(claims, "admins");

  // Gate 1: who are you? (401)
  if (!callerSub) {
    return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  if (!event.pathParameters) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Fail to fetch Path Params" }) };
  }

  if (!event.body) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "event body missing" }) };
  }

  // Gate 2: build the key for this table. Each table has its own update rule:
  //   Sessions:         owner only. The key includes callerSub, so a session that
  //                     belongs to someone else simply isn't found (404).
  //   SessionExercises: owner only. The key has no user, so we check the
  //                     owner after the lookup (Gate 4).
  //   Exercises:        admin only (checked here). Any admin may edit any exercise.
  let key: Record<string, string | undefined>;
  switch (tableName) {
    case "Sessions":
      key = { sessionId: event.pathParameters.sessionId, userId: callerSub };
      break;
    case "SessionExercises":
      key = { sessionExerciseId: event.pathParameters.sessionExerciseId };
      break;
    case "Exercises":
      if (!isAdmin) {
        return { statusCode: 403, headers: CORS_HEADERS, body: JSON.stringify({ error: "Forbidden" }) };
      }
      key = { exerciseId: event.pathParameters.exerciseId };
      break;
    default:
      return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ error: "Path Failure" }) };
  }

  // Every part of the key must have a value (e.g. the id in the URL was present).
  if (Object.values(key).some((value) => !value)) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Item not specified" }) };
  }

  // Parse the body now, after the role check. Bad JSON is the caller's fault (400).
  let safeBody: Record<string, any>;
  try {
    const { userId, ...rest } = JSON.parse(event.body); // any client-sent userId is thrown away
    safeBody = rest;
  } catch {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Invalid JSON in request body" }) };
  }

  // Gate 3: does the item exist? (404)
  const existing = await docClient.send(new GetCommand({
    TableName: tableName,
    Key: key,
  }));

  if (!existing.Item) {
    return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ error: "Item not found" }) };
  }

  // Gate 4: owner check, ONLY for the table whose key doesn't include the user.
  if (tableName === "SessionExercises" && existing.Item.userId !== callerSub) {
    return { statusCode: 403, headers: CORS_HEADERS, body: JSON.stringify({ error: "Forbidden" }) };
  }

  // Fields that always come from the STORED item, never from the request.
  // Some items (e.g. exercises added by hand) have no userId, so only pin it if it exists.
  const pinned: Record<string, any> = {};
  if (existing.Item.userId) {
    pinned.userId = existing.Item.userId;
  }
  // Security item 2.2: a session exercise can never be moved into another session.
  if (tableName === "SessionExercises" && existing.Item.sessionId) {
    pinned.sessionId = existing.Item.sessionId;
  }

  try {
    await docClient.send(new PutCommand({
      TableName: tableName,
      Item: { ...safeBody, ...key, ...pinned },
    }));
  } catch (error) {
    console.error("Failed to update item:", error); // full detail stays in the logs
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: "Failed to update" }) };
  }

  return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ message: "updated" }) };
};
