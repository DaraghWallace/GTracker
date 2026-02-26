import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const tableName = process.env.TABLE_NAME!;

export const handler = async (event: APIGatewayProxyEvent) => {
  const userId = event.pathParameters?.userId;

  if (!userId) {
    return { statusCode: 400, body: "Missing userId" };
  }

  const result = await docClient.send(
    new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: {
        ":uid": userId,
      },
    })
  );

  return {
    statusCode: 200,
    body: JSON.stringify(result.Items ?? []),
  };
};