// lambda/functions/generic/getItem.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
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

  const id = event.pathParameters?.id;
  if (!id) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "id required" }) };
  }

  try {
    const result = await docClient.send(new GetCommand({
      TableName: process.env.TABLE_NAME!,
      Key: { [process.env.PARTITION_KEY_NAME!]: id },
    }));

    if (!result.Item) {
      return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ error: "Not found" }) };
    }

    // Gate 1: this table is public (e.g. Exercises) — anyone authenticated can read
    const isPublicTable = process.env.IS_PUBLIC === "true";

    // Gate 2: caller owns the item
    const ownershipField = process.env.OWNERSHIP_FIELD; // e.g. "userId"
    const isOwner = ownershipField ? result.Item[ownershipField] === callerSub : false;

    // Gate 3: caller is a developer
    const callerUserType = event.requestContext.authorizer?.claims?.["custom:userType"];
    const isDeveloper = callerUserType === "developer";

    if (!isPublicTable && !isOwner && !isDeveloper) {
      return { statusCode: 403, headers: CORS_HEADERS, body: JSON.stringify({ error: "Forbidden" }) };
    }

    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(result.Item) };
  } catch (error) {
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: String(error) }) };
  }
};