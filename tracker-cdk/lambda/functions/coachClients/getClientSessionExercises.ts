import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";
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

    const result = await docClient.send(new QueryCommand({
      TableName: process.env.SESSION_EXERCISES_TABLE!,
      IndexName: "sessionId-index",
      KeyConditionExpression: "sessionId = :sid",
      // Only rows owned by the session's owner. Anything else carrying this sessionId is not theirs.
      FilterExpression: "userId = :owner",
      ExpressionAttributeValues: { ":sid": sessionId, ":owner": session.userId },
    }));

    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(result.Items ?? []) };
  } catch (error) {
    console.error("getClientSessionExercises failed:", error);
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: "Internal server error" }) };
  }
};
