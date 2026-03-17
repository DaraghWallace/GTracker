import { DynamoDBDocumentClient, PutCommand,} from "@aws-sdk/lib-dynamodb";

export class UserService {

  constructor(private tableName: string, private docClient: any) {}

  async createUserProfile(
    nickname: string,
    userType: string,
    userId: string,
    email?: string
  ) {

    const command = new PutCommand({
      TableName: this.tableName,
      Item: {
        userId,
        email,
        nickname,
        userType,
        createdAt: new Date().toISOString(),
      },
      ConditionExpression: "attribute_not_exists(userId)",
    });

    await this.docClient.send(command);
  }
}