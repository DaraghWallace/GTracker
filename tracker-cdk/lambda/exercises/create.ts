import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand,} from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";
import { v4 as uuid } from "uuid";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const tableName = process.env.TABLE_NAME!;

export const handler = async (event: APIGatewayProxyEvent) => {
  const body = JSON.parse(event.body || "{}");

  const exersise = {
    ...body,
    exersiseId: uuid(),
    date: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: tableName,
      Item: exersise,
    })
  );

  return {
    statusCode: 200, headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
    },body: JSON.stringify({
      message: "Exercise created",
    }),
  };
};