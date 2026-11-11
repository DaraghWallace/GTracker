import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

const reply = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: CORS_HEADERS,
  body: JSON.stringify(body),
});

// Returns the caller's session exercises for ONE of the caller's own sessions.
export const handler = async (event: APIGatewayProxyEvent) => {
  const sessionId = event.queryStringParameters?.sessionId;
  const callerSub = event.requestContext.authorizer?.claims?.sub;

  if (!callerSub) {
    return reply(401, { error: "Unauthorized" });
  }

  if (!sessionId) {
    return reply(400, { error: "sessionId is required" });
  }

  try {
    const session = await docClient.send(new GetCommand({
      TableName: process.env.OTHER_TABLE,
      Key: { sessionId, userId: callerSub },
    }));

    if (!session.Item) {
      return reply(404, { error: "Session not found" });
    }

    const result = await docClient.send(new QueryCommand({
      TableName: process.env.TABLE_NAME,
      IndexName: "sessionId-index",
      KeyConditionExpression: "sessionId = :sid",
      FilterExpression: "userId = :uid",
      ExpressionAttributeValues: { ":sid": sessionId, ":uid": callerSub },
    }));

    return reply(200, result.Items ?? []);
  } catch (error) {
    console.error("getBySession failed:", error);
    return reply(500, { error: "Internal server error" });
  }
};
