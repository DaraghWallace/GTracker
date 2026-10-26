import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";
import { randomUUID } from "crypto";
import { isInGroup } from "../auth";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

export const handler = async (event: APIGatewayProxyEvent) => {
  const trainerId = event.requestContext.authorizer?.claims?.sub;
  if (!trainerId) {
    return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  const claims = event.requestContext.authorizer?.claims;
  const isTrainer = isInGroup(claims, "admins") || isInGroup(claims, "trainers") 

  if (!isTrainer) {
    return { statusCode: 403, headers: CORS_HEADERS, body: JSON.stringify({ error: "Not a trainer" }) };
  }

  const sessionId = event.pathParameters?.sessionId;
  if (!sessionId) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "sessionId required" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  try {
    const sessionResult = await docClient.send(new QueryCommand({
      TableName: process.env.SESSIONS_TABLE!,
      KeyConditionExpression: "sessionId = :sid",
      ExpressionAttributeValues: { ":sid": sessionId },
      Limit: 1,
    }));

    const session = sessionResult.Items?.[0];
    if (!session) {
      return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ error: "Session not found" }) };
    }

    const profile = await docClient.send(new GetCommand({
      TableName: process.env.USER_PROFILES_TABLE!,
      Key: { userId: session.userId },
    }));

    if (profile.Item?.currentTrainerId !== trainerId) {
      return { statusCode: 403, headers: CORS_HEADERS, body: JSON.stringify({ error: "Not your client's session" }) };
    }

    const newItem = {
      ...body,
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
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: String(error) }) };
  }
};