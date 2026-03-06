import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";


const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const ddbClient = new DynamoDBClient({ region: "ap-southeast-2" });

export const handler = async () => {
  try {
    const params = { TableName: "Exercises" };
    const data = await ddbClient.send(new ScanCommand(params));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PATCH,DELETE",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify(data.Items),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PATCH,DELETE",
        "Access-Control-Allow-Headers": "*",
      },
      body: `Could not 'getPageItems()': ${error}`,
    };
  }
};