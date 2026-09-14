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

  let key: Record<string, string> | undefined;
  let checkOwnerManually = false;
  let requireDeveloper = false;
  
  switch (process.env.TABLE_NAME) {
    case "Sessions":
      if (event.pathParameters?.sessionId && callerSub) {
        key = { sessionId: event.pathParameters.sessionId, userId: callerSub };
      }
      break;
    case "SessionExercises":
      if (event.pathParameters?.sessionExerciseId) {
        key = { sessionExerciseId: event.pathParameters.sessionExerciseId }; // no userId here
        checkOwnerManually = true;
      }
      break;
    case "Exercises":
      if (!event.pathParameters?.exerciseId) { break }
      key = { exerciseId: event.pathParameters?.exerciseId };
      requireDeveloper = true;
      break;
    default:
      return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ error: "Path Failure" }) };
  }

  if (!callerSub) {
    return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: "Unauthorized" }) };
  }
  if (!key) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Item not specified" }) };
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

  if (requireDeveloper) {
    const userType = event.requestContext.authorizer?.claims?.["custom:userType"];
    if (userType !== "developer") {
      return { statusCode: 403, headers: CORS_HEADERS, body: JSON.stringify({ error: "Forbidden" }) };
    }
  }

  await docClient.send(new DeleteCommand({
    TableName: process.env.TABLE_NAME,
    Key: key,
  }));

  return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ message: "Item deleted" }) };
};