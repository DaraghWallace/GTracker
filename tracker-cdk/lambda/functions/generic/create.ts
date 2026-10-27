import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";
import { isInGroup } from "../auth";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event: APIGatewayProxyEvent) => {
  const tableName = process.env.TABLE_NAME!;
  const claims = event.requestContext.authorizer?.claims;

  const callerSub = claims?.sub;
  const isAdmin = isInGroup(claims, "admins");

  if (!callerSub) {
    return {
      statusCode: 401,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Unauthorized" }),
    };
  }

  if (tableName === "Exercises" && !isAdmin) {
    return {
      statusCode: 403,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Forbidden" }),
    };
  }

  if (!event.body) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "event body missing" }),
    };
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
    dateDone: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: tableName,
      Item: newItem,
    })
  );

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
    },
    body: JSON.stringify({ message: `Sent to ${tableName}` }),
  };
};