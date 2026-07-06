import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand,} from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const tableName = process.env.TABLE_NAME!;

export const handler = async (event: APIGatewayProxyEvent) => {
  const callerSub = event.requestContext.authorizer?.claims?.sub;

  if (!callerSub) {
    return {
      statusCode: 401,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Unauthorized" }),
    };
  }

  if (!event.body) return {
    statusCode: 400,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({ error: "event body missing " }),
  }

  let safeBody;
  try {
    const { userId, ...rest } = JSON.parse(event.body);
    safeBody = rest;
  } catch {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Invalid JSON in request body" }),
    };
  }

  const newItem = {
    ...safeBody,
    userId: callerSub,
    date: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: tableName,
      Item: newItem,
    })
  );

  return {
    statusCode: 200, headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
    },body: JSON.stringify({message: `Sent to ${tableName}` }),
  };  
};
