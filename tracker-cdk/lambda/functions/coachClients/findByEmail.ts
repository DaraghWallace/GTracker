import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

export const handler = async (event: APIGatewayProxyEvent) => {
  const callerSub = event.requestContext.authorizer?.claims?.sub;
  if (!callerSub) {
    return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  const groups = event.requestContext.authorizer?.claims?.["cognito:groups"] ?? "";
  if (!groups.includes("trainers")) {
    return { statusCode: 403, headers: CORS_HEADERS, body: JSON.stringify({ error: "Not a trainer" }) };
  }

  const email = event.queryStringParameters?.email;
  if (!email) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "email required" }) };
  }

  try {
    // Scan + filter for now — fine at current scale, revisit with an email GSI if this table grows.
    const result = await docClient.send(new ScanCommand({
      TableName: process.env.TABLE_NAME!,
      FilterExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email },
    }));

    const match = result.Items?.[0];
    if (!match) {
      return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ error: "No user found" }) };
    }

    // Only return what's needed to confirm identity — not the full profile.
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ userId: match.userId, nickname: match.nickname }),
    };
  } catch (error) {
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: String(error) }) };
  }
};