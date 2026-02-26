import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand,} from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";
import { v4 as uuid } from "uuid";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const tableName = process.env.TABLE_NAME!;

export const handler = async (event: APIGatewayProxyEvent) => {
  const body = JSON.parse(event.body || "{}");

  const session = {
    ...body,
    sessionId: uuid(),
    date: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: tableName,
      Item: session,
    })
  );

  return {
    statusCode: 201,
    body: JSON.stringify(session),
  };
};