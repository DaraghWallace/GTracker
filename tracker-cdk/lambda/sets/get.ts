import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const tableName = process.env.TABLE_NAME!;

export const handler = async (event: APIGatewayProxyEvent) => {
  const exersiseId = event.pathParameters?.userId;

  if (!exersiseId) {
    return { statusCode: 400, body: "Missing exersiseId" };
  }

  const result = await docClient.send(
    new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: "exersiseId = :uid",
      ExpressionAttributeValues: {
        ":uid": exersiseId,
      },
    })
  );

  return {
    statusCode: 200,
    body: JSON.stringify(result.Items ?? []),
  };
};