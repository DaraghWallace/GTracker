import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";
import { randomUUID } from "crypto";

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

  const groups = event.requestContext.authorizer?.claims?.["cognito:groups"] ?? "";
  const userType = event.requestContext.authorizer?.claims?.["custom:userType"];
  const isTrainer = groups.includes("trainers") || userType === "developer";

  if (!isTrainer) {
    return { statusCode: 403, headers: CORS_HEADERS, body: JSON.stringify({ error: "Not a trainer" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { traineeId, ...sessionData } = body;
  if (!traineeId) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "traineeId required" }) };
  }

  try {
    // Verify this trainer actually owns this client before writing anything.
    const profile = await docClient.send(new GetCommand({
      TableName: process.env.USER_PROFILES_TABLE!,
      Key: { userId: traineeId },
    }));

    if (profile.Item?.currentTrainerId !== trainerId) {
      return { statusCode: 403, headers: CORS_HEADERS, body: JSON.stringify({ error: "Not your client" }) };
    }

    const newItem = {
      ...sessionData,
      sessionId: randomUUID(),
      userId: traineeId,      // the session belongs to the trainee, not the trainer
      createdBy: trainerId,   // audit trail — who actually logged it
      date: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({
      TableName: process.env.SESSIONS_TABLE!,
      Item: newItem,
    }));

    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(newItem) };
  } catch (error) {
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: String(error) }) };
  }
};