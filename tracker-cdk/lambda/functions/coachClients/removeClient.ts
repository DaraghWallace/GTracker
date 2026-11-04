import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";
import { isInGroup } from "../auth";

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

  let clientId: unknown;
  try {
    clientId = JSON.parse(event.body ?? "{}")?.clientId;
  } catch {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  if (typeof clientId !== "string" || clientId === "") {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "clientId required" }) };
  }

  try {
    await docClient.send(new UpdateCommand({
      TableName: process.env.USER_PROFILES_TABLE!,
      Key: { userId: clientId },
      UpdateExpression: "REMOVE currentTrainerId",
      ConditionExpression: "currentTrainerId = :trainerId",
      ExpressionAttributeValues: { ":trainerId": trainerId },
    }));

    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ success: true }) };
  } catch (error: any) {
    if (error.name === "ConditionalCheckFailedException") {
      return { statusCode: 409, headers: CORS_HEADERS, body: JSON.stringify({ error: "Client is not currently your client" }) };
    }
    console.error("removeClient failed:", error);
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: "Internal server error" }) };
  }
};
