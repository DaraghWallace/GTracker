import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
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

  try {
    const result = await docClient.send(new QueryCommand({
      TableName: process.env.TABLE_NAME!,
      IndexName: "currentTrainerId-index",
      KeyConditionExpression: "currentTrainerId = :trainerId",
      ExpressionAttributeValues: { ":trainerId": trainerId },
    }));

    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(result.Items ?? []) };
  } catch (error) {
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: String(error) }) };
  }
};