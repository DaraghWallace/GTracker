import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

export const handler = async (event: APIGatewayProxyEvent) => {
  const callerSub = event.requestContext.authorizer?.claims?.sub;

  let key: Record<string, string> | undefined;
  let checkOwnerManually = false;

  switch (process.env.TABLE_NAME) {
    case "Sessions":
      if (event.pathParameters?.sessionId && callerSub) {
        key = { sessionId: event.pathParameters.sessionId, userId: callerSub };
      }
      break;
    case "SessionExercises":
      if (event.pathParameters?.sessionExerciseId) {
        key = { sessionExerciseId: event.pathParameters.sessionExerciseId };
        checkOwnerManually = true; // no userId in this table's key
      }
      break;
    case "Exercises":
      if (event.pathParameters?.exerciseId && callerSub) {
        key = { exerciseId: event.pathParameters.exerciseId, userId: callerSub };
      }
      break;
    default:
      break;
  }

  if (!callerSub) {
    return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  if (!key) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Item not specified" }) };
  }

  if (!event.body) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "event body missing" }) };
  }

  const existing = await docClient.send(new GetCommand({
    TableName: process.env.TABLE_NAME,
    Key: key,
  }));

  if (!existing.Item) {
    return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ error: "Item not found" }) };
  }

  if (checkOwnerManually && existing.Item.userId !== callerSub) {
    return { statusCode: 403, headers: CORS_HEADERS, body: JSON.stringify({ error: "Forbidden" }) };
  }

  const { userId, ...safeBody } = JSON.parse(event.body);

  await docClient.send(new PutCommand({
    TableName: process.env.TABLE_NAME!,
    Item: { ...safeBody, ...key, userId: callerSub },
  }));

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ message: "updated" }),
  };
};