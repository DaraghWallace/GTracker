import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";
import { isInGroup } from "../auth";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

export const handler = async (event: APIGatewayProxyEvent) => {
  const claims = event.requestContext.authorizer?.claims;
  const trainerId = claims?.sub;
  if (!trainerId) {
    return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  const isTrainer = isInGroup(claims, "trainers") || isInGroup(claims, "admins");
  if (!isTrainer) {
    return { statusCode: 403, headers: CORS_HEADERS, body: JSON.stringify({ error: "Not a trainer" }) };
  }

  try {
    const result = await docClient.send(new QueryCommand({
      TableName: process.env.TABLE_NAME!,
      IndexName: "currentTrainerId-index",
      KeyConditionExpression: "currentTrainerId = :trainerId",
      ExpressionAttributeValues: { ":trainerId": trainerId },
    }));

    // Allow-list: only the fields the coaching screen shows. email, userType etc. stay private.
    const clients = (result.Items ?? []).map((c) => ({
      userId: c.userId,
      nickname: c.nickname,
      height_cm: c.height_cm,
      cur_weight: c.cur_weight,
      tar_weight: c.tar_weight,
      goal: c.goal,
    }));

    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(clients) };
  } catch (error) {
    console.error("listClients failed:", error);
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: "Internal server error" }) };
  }
};
