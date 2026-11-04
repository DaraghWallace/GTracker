import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
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
  const isAdmin = isInGroup(claims, "admins");

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

    const isPublicTable = process.env.IS_PUBLIC === "true";

    const ownershipField = process.env.OWNERSHIP_FIELD; 
    const isOwner = ownershipField ? result.Item[ownershipField] === callerSub : false;


    if (!isPublicTable && !isOwner && !isAdmin) {
      return { statusCode: 403, headers: CORS_HEADERS, body: JSON.stringify({ error: "Forbidden" }) };
    }

    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(result.Item) };
  } catch (error) {
    console.error("getItem failed:", error); // detail stays in the logs
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: "Internal server error" }) };
  }
};
