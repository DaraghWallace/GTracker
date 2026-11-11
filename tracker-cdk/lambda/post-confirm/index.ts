import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { PostConfirmationTriggerEvent } from "aws-lambda";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const NICKNAME_MAX_LENGTH = 50;
const DEFAULT_NICKNAME = "Member";

// Runs after a user confirms their email. Creates their profile row.
export const handler = async (event: PostConfirmationTriggerEvent) => {
  if (event.triggerSource !== "PostConfirmation_ConfirmSignUp") {
    return event;
  }

  const attributes = event.request.userAttributes;
  const userId = attributes.sub;
  const email = attributes.email;
  const nickname = (attributes.nickname ?? "").trim().slice(0, NICKNAME_MAX_LENGTH) || DEFAULT_NICKNAME;

  try {
    await docClient.send(new PutCommand({
      TableName: process.env.TABLE_NAME!,
      Item: {
        userId,
        nickname,
        createdAt: new Date().toISOString(),
        ...(email ? { email } : {}), // only add email when there is one
      },
      ConditionExpression: "attribute_not_exists(userId)", // never overwrite an existing profile
    }));
  } catch (error: any) {
    if (error?.name === "ConditionalCheckFailedException") {
      return event; // do nothing profile is already there 
    }
    console.error("post-confirm failed:", error);
    throw error;
  }

  return event;
};
