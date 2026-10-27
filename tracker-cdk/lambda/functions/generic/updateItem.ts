import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
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
  const isTrainer = isInGroup(claims, "trainers");

  if (!callerSub) {
    return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  if (!event.pathParameters) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Fail to fetch Path Params" }), };
  }
  
  if (!event.body) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "event body missing" }) };
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
      if (!isAdmin || !isTrainer) {
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

    
  try {
    const { userId, ...safeBody } = JSON.parse(event.body);

    await docClient.send(new PutCommand({
      TableName: tableName!,
      Item: { ...safeBody, ...key, userId: existing.Item.userId }
    }));

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "updated" }),
    };
  } catch (error) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Failed to update" }) };
  }

};