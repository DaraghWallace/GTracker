import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event: APIGatewayProxyEvent) => {
  const sessionId = event.queryStringParameters?.sessionId;
  const callerSub = event.requestContext.authorizer?.claims?.sub 

  if (!callerSub) {
    return {
      statusCode: 401,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Unauthorized" }),
    };
  }


  if (!sessionId) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "sessionId is required" }),
    };
  }


  const sessionResult = await docClient.send(
    new QueryCommand({
      TableName: process.env.OTHER_TABLE,
      KeyConditionExpression: "sessionId = :sid",
      ExpressionAttributeValues: {
        ":sid": sessionId,
      },
      Limit: 1,
    })
  );

  const session = sessionResult.Items?.[0];

  if (!session) {
    return {
      statusCode: 404,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Session not found" }),
    };
  }

  if (session.userId !== callerSub) {
    return {
      statusCode: 403,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Forbidden" }),
    };
  }

  const result = await docClient.send(
    new QueryCommand({
      TableName: process.env.TABLE_NAME,
      IndexName: "sessionId-index",
      KeyConditionExpression: "sessionId = :sid",
      ExpressionAttributeValues: {
        ":sid": sessionId,
      },
    })
  );

  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify(result.Items ?? []),
  };
};