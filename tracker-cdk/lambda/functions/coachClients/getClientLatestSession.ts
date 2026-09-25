import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";

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

  const clientId = event.pathParameters?.clientId;
  if (!clientId) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "clientId required" }) };
  }

  try {
    const profile = await docClient.send(new GetCommand({
      TableName: process.env.USER_PROFILES_TABLE!,
      Key: { userId: clientId },
    }));

    if (profile.Item?.currentTrainerId !== trainerId) {
      return { statusCode: 403, headers: CORS_HEADERS, body: JSON.stringify({ error: "Not your client" }) };
    }

    const result = await docClient.send(new QueryCommand({
      TableName: process.env.SESSIONS_TABLE!,
      IndexName: "userId-index",
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: { ":uid": clientId },
      ScanIndexForward: false, // newest dateDone first
      Limit: 1,
    }));

    const latest = result.Items?.[0] ?? null;
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(latest) };
  } catch (error) {
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: String(error) }) };
  }
};