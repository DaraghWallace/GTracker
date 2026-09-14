import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
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

  const body = JSON.parse(event.body ?? "{}");
  const { clientId } = body;

  if (!clientId) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "clientId required" }) };
  }

  const groups = event.requestContext.authorizer?.claims?.["cognito:groups"] ?? "";
  const userType = event.requestContext.authorizer?.claims?.["custom:userType"];
  const isTrainer = groups.includes("trainers") || userType === "developer";

  if (!isTrainer) {
    return { statusCode: 403, headers: CORS_HEADERS, body: JSON.stringify({ error: "Not a trainer" }) };
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
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: String(error) }) };
  }
};