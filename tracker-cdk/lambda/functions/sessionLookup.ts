import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

export type SessionLookup =
  | { status: "found"; session: Record<string, any> }
  | { status: "notFound" }
  | { status: "ambiguous" };

export async function findSessionById(
  docClient: DynamoDBDocumentClient,
  tableName: string,
  sessionId: string,
): Promise<SessionLookup> {
  const result = await docClient.send(new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: "sessionId = :sid",
    ExpressionAttributeValues: { ":sid": sessionId },
    Limit: 2,
  }));

  const items = result.Items ?? [];
  if (items.length === 0) return { status: "notFound" };
  if (items.length > 1) return { status: "ambiguous" };
  return { status: "found", session: items[0] };
}
