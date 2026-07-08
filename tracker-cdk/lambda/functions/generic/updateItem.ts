import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event: APIGatewayProxyEvent) => {
  const sessionId = event.pathParameters?.sessionId; 
  const callerSub = event.requestContext.authorizer?.claims?.sub;

  if (!callerSub) {
    return { statusCode: 401, headers: { "Access-Control-Allow-Origin": "*" }, 
    body: JSON.stringify({ error: "Unauthorized" }) };
  }

  if (!sessionId) {
    return { statusCode: 400, headers: { "Access-Control-Allow-Origin": "*" }, 
    body: JSON.stringify({ error: "Item Not specified" }) };
  }

  if (!event.body) {
    return { statusCode: 400, headers: { "Access-Control-Allow-Origin": "*" }, 
    body: JSON.stringify({ error: "event body missing" }) };
  }

  const thisItem = await docClient.send(new GetCommand({
    TableName: process.env.TABLE_NAME,
    Key: { sessionId, userId: callerSub },
  }));

  if (!thisItem.Item) {
    return { statusCode: 404, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ error: "Item not found" }) };
  }

  const { userId, ...safeBody } = JSON.parse(event.body);

  await docClient.send(new PutCommand({
    TableName: process.env.TABLE_NAME!,
    Item: { ...safeBody, sessionId, userId: callerSub },
  }));

  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" },
    body: JSON.stringify({ message: "updated" }),
  };
};