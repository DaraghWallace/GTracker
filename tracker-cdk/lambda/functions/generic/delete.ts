import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

export const handler = async (event: APIGatewayProxyEvent) => {
  const pk = event.queryStringParameters?.PK;
  const callerSub = event.requestContext.authorizer?.claims?.sub;

  if (!callerSub) return { 
    statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: "Unauthorized" }) 
  };
  
  if (!pk) return { 
    statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Item not specified" }) 
  };

  const existing = await docClient.send(new GetCommand({
    TableName: process.env.TABLE_NAME,
    Key: { PK: pk }
  }));

  if (!existing.Item) {
    return {
      statusCode: 404,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Item not found" }),
    };
  }

  if (existing.Item.userId !== callerSub) {
    return {
      statusCode: 403,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Forbidden" }),
    };
  }

  await docClient.send(new DeleteCommand({
    TableName: process.env.TABLE_NAME,
    Key: { PK: pk }
  }));

  return { 
    statusCode: 200, 
    headers: CORS_HEADERS,
    body: JSON.stringify({ message: "Item deleted" }) 
  };
};