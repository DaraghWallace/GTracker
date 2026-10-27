import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";
import { isInGroup } from "../auth";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

export const handler = async (event: APIGatewayProxyEvent) => {
  const tableName = process.env.TABLE_NAME!;
  const claims = event.requestContext.authorizer?.claims;

  const callerSub = claims?.sub;
  const isAdmin = isInGroup(claims, "admins");

  if (!callerSub) {
    return {
      statusCode: 401,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Unauthorized" }),
    };
  }

  if (!event.pathParameters) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Fail to fetch Path Params" }),
    };
  }

  let key: Record<string, string | undefined>;
  switch (tableName) {
    case "Sessions":
      key = { sessionId: event.pathParameters.sessionId, userId: callerSub };
      break;
    case "SessionExercises":
      key = { sessionExerciseId: event.pathParameters.sessionExerciseId };
      break;
    case "Exercises":
      if (!isAdmin) {
        return {
          statusCode: 403,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: "Forbidden" }),
        };
      }
      key = { exerciseId: event.pathParameters.exerciseId };
      break;
    default:
      return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ error: "Path Failure" }) };
  }

  const existing = await docClient.send(new GetCommand({
    TableName: tableName,
    Key: key,
  }));

  if (!existing.Item) {
    return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ error: "Item not found" }) };
  }

  if (tableName === "SessionExercises" && existing.Item.userId !== callerSub) {
    return { statusCode: 403, headers: CORS_HEADERS, body: JSON.stringify({ error: "Forbidden" }) };
  }

  await docClient.send(new DeleteCommand({
    TableName: tableName,
    Key: key,
  }));

  return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ message: "Item deleted" }) };
};