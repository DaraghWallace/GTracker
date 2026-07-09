import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

export const handler = async (event: APIGatewayProxyEvent) => {
  const callerSub = event.requestContext.authorizer?.claims?.sub;
  let key = undefined
  switch (process.env.TABLE_NAME) {
    case "Sessions":
      key = { sessionId: event.pathParameters?.sessionId, userId: callerSub }
      break;
    case "SessionExercises":
      key = { sessionExerciseId: event.pathParameters?.sessionExerciseId }
      break;
    case "Exercises":
      key = { exerciseId: event.pathParameters?.exerciseId, userId: callerSub }
      break;
    default:
      break;
  }


  if (!callerSub) return { 
    statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: "Unauthorized" }) 
  };
  
  if (!key) return { 
    statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Item not specified" }) 
  };

  const existing = await docClient.send(new GetCommand({
    TableName: process.env.TABLE_NAME,
     Key: key
  }));

  if (!existing.Item) {
    return {
      statusCode: 404,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Item not found" }),
    };
  }

  await docClient.send(new DeleteCommand({
    TableName: process.env.TABLE_NAME,
     Key: key
  }));

  return { 
    statusCode: 200, 
    headers: CORS_HEADERS,
    body: JSON.stringify({ message: "Item deleted" }) 
  };
};