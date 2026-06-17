import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event: APIGatewayProxyEvent) => {
  const userId = event.requestContext.authorizer?.claims?.sub;
  const { startDate, endDate } = event.queryStringParameters ?? {};

  if (!userId) {
    return {
      statusCode: 401,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "userId is required" }),
    };
  }

  try {
    const result = await docClient.send(
      new QueryCommand({
        TableName: process.env.TABLE_NAME,
        IndexName: "userId-index",
        KeyConditionExpression: "userId = :uid AND dateDone BETWEEN :start AND :end",
        ExpressionAttributeValues: {
          ":uid": userId,
          ":start": startDate ?? `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`,
          ":end":   endDate   ?? new Date().toISOString().split("T")[0],
        },
      })
    );

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(result.Items),
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify("Internal Server Error"),
    };
  }
};