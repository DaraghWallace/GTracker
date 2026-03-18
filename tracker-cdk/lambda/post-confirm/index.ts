import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";

import {
  PostConfirmationTriggerEvent,
  Context,
  Callback,
} from "aws-lambda";

//#region: User Profiles:
class UserProfileService {
  private docClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor() {
    const client = new DynamoDBClient({});
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = process.env.TABLE_NAME!;
  }

  async createUserProfile(nickname:string, userType: string, userId: string, email?: string) {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: {
        userId,
        email,
        nickname,
        userType,
        createdAt: new Date().toISOString(),
      },
      ConditionExpression: "attribute_not_exists(userId)", // avoid overwrite
    });

    await this.docClient.send(command);
  }
}

class PostConfirmationHandler {
  private service = new UserProfileService();
  async handle(event: PostConfirmationTriggerEvent) {
    const userId = event.request.userAttributes.sub;
    const email = event.request.userAttributes.email;
    const nickname = event.request.userAttributes["nickname"];
    const userType = event.request.userAttributes["custom:userType"];

    await this.service.createUserProfile(nickname, userType, userId, email);
    return event;
  }
}
//#endregion


const handlerInstance = new PostConfirmationHandler();
export const handler = async (
  event: PostConfirmationTriggerEvent,
  context: Context,
  callback: Callback
) => {
  try {
    const result = await handlerInstance.handle(event);
    callback(null, result);
  } catch (error) {
    callback(error as Error);
  }
};