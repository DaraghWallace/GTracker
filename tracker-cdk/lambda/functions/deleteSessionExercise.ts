import { DynamoDBClient, DeleteItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME!;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

export const handler = async (event: any) => {
  const sessionExerciseId = event.pathParameters?.sessionExerciseId;

  if (!sessionExerciseId) {
    return { 
      statusCode: 400, 
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Missing sessionExerciseId" }) 
    };
  }

  await client.send(new DeleteItemCommand({
    TableName: TABLE_NAME,
    Key: {
      sessionExerciseId: { S: sessionExerciseId },
    },
  }));

  return { 
    statusCode: 200, 
    headers: CORS_HEADERS,
    body: JSON.stringify({ message: "Session exercise deleted" }) 
  };
};