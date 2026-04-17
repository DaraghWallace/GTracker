import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { UserPool } from 'aws-cdk-lib/aws-cognito';

interface UserProfilesProps {
  userPool: UserPool;
}

export class UserProfiles extends Construct {
  constructor(scope: Construct, id: string, props: UserProfilesProps) {
    super(scope, id);

    const { userPool } = props;

    // --- Table ---
    const table = new dynamodb.Table(this, 'Table', {
      tableName: 'GtUserProfiles',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const postConfirmFn = new NodejsFunction(this, 'PostConfirmFn', {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: 'lambda/post-confirm/index.ts',
      handler: 'handler',
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    table.grantWriteData(postConfirmFn);

    userPool.addTrigger(
      cognito.UserPoolOperation.POST_CONFIRMATION,
      postConfirmFn
    );
  }
}