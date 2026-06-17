// lambda/functions/updateSession.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event: APIGatewayProxyEvent) => {
  const pk = event.queryStringParameters?.PK;
  const callerSub = event.requestContext.authorizer?.claims?.sub;

  if (!pk) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Item Not specified" }),
    };
  }
  
  const thisItem = await docClient.send(new GetCommand({
    TableName: process.env.TABLE_NAME,
    Key: { PK: pk }
  }));
  
  if (!thisItem.Item) {
    return {
      statusCode: 404,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Item not found" }),
    };
  }

  if (thisItem.Item.userId !== callerSub) {
    return {
      statusCode: 403,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Forbidden" }),
    };
  }
  
  if (!event.body) return {
    statusCode: 400,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({ error: "event body missing " }),
  }

  const { userId, ...safeBody } = JSON.parse(event.body);

  await docClient.send(new PutCommand({
    TableName: process.env.TABLE_NAME!,
    Item: {...safeBody, PK: pk },
  }));

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    },
    body: JSON.stringify({ message: "updated" }),
  };
};