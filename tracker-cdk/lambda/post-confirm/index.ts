import { DynamoDB } from "aws-sdk";

const dynamo = new DynamoDB.DocumentClient();

export const handler = async (event: any) => {
  console.log("Post confirmation trigger:", JSON.stringify(event, null, 2));

  const { sub, email } = event.request.userAttributes;

  await dynamo.put({
    TableName: process.env.TABLE_NAME!,
    Item: {
      userId: sub,
      email,
      role: "member",
      stats: {},
      createdAt: new Date().toISOString(),
    },
  }).promise();

  return event;
};