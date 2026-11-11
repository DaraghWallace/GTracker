import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";
import { randomUUID } from "crypto";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

const reply = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: CORS_HEADERS,
  body: JSON.stringify(body),
});

export const handler = async (event: APIGatewayProxyEvent) => {
  const tableName = process.env.SESSIONS_TABLE!;

  // Gate 1: who are you? (401)
  const callerSub = event.requestContext.authorizer?.claims?.sub;
  if (!callerSub) {
    return reply(401, { error: "Unauthorized" });
  }

  // Gate 2: is the body valid JSON? (400)
  let body: Record<string, any>;
  try {
    body = JSON.parse(event.body ?? "");
  } catch {
    return reply(400, { error: "Invalid JSON in request body" });
  }
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return reply(400, { error: "Invalid session fields" });
  }

  // Gate 3: validate the few fields a client may send (400). Anything else in the body is never copied.
  const { userWeight, focus, notes } = body;
  const validWeight = userWeight === undefined || (typeof userWeight === "number" && Number.isFinite(userWeight) && userWeight >= 0 && userWeight <= 500);
  const validFocus  = focus === undefined || focus === null || (typeof focus === "string" && focus.length <= 50);
  const validNotes  = notes === undefined || notes === null || (typeof notes === "string" && notes.length <= 500);
  if (!validWeight || !validFocus || !validNotes) {
    return reply(400, { error: "Invalid session fields" });
  }

  const newItem = {
    sessionId: randomUUID(),
    userId: callerSub,
    dateDone: new Date().toISOString(),
    ...(userWeight !== undefined ? { userWeight } : {}),
    focus: focus ?? null,
    notes: notes ?? null,
  };

  try {
    await docClient.send(new PutCommand({
      TableName: tableName,
      Item: newItem,
      ConditionExpression: "attribute_not_exists(sessionId)",
    }));
  } catch (error) {
    console.error("createSession failed:", error); // detail stays in the logs
    return reply(500, { error: "Failed to create" });
  }

  return reply(200, newItem);
};
