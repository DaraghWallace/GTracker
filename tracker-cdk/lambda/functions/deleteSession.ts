import { DynamoDBClient, DeleteItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME!;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

export const handler = async (event: any) => {
  const sessionId = event.pathParameters?.sessionId;
  const userId = event.requestContext?.authorizer?.claims?.sub;

  if (!sessionId || !userId) {
    return { 
      statusCode: 400, 
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Missing sessionId or userId" }) 
    };
  }

  await client.send(new DeleteItemCommand({
    TableName: TABLE_NAME,
    Key: {
      sessionId: { S: sessionId },
      userId: { S: userId },
    },
  }));

  return { 
    statusCode: 200, 
    headers: CORS_HEADERS,
    body: JSON.stringify({ message: "Session deleted" }) 
  };
};