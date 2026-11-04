import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";
import { isInGroup } from "../auth";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

export const handler = async (event: APIGatewayProxyEvent) => {
  const claims = event.requestContext.authorizer?.claims;
  const callerSub = claims?.sub;
  if (!callerSub) {
    return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  const isTrainer = isInGroup(claims, "trainers") || isInGroup(claims, "admins");
  if (!isTrainer) {
    return { statusCode: 403, headers: CORS_HEADERS, body: JSON.stringify({ error: "Not a trainer" }) };
  }

  const email = event.queryStringParameters?.email;
  if (!email) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "email required" }) };
  }

  try {
    // Query the email-index GSI (needs the index added in user-profiles.ts and deployed).
    const result = await docClient.send(new QueryCommand({
      TableName: process.env.TABLE_NAME!,
      IndexName: "email-index",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email },
      Limit: 1,
    }));

    const match = result.Items?.[0];
    if (!match) {
      return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ error: "No user found" }) };
    }

    // Allow-list: only what's needed to confirm identity, not the full profile.
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ userId: match.userId, nickname: match.nickname }),
    };
  } catch (error) {
    console.error("findByEmail failed:", error);
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: "Internal server error" }) };
  }
};
