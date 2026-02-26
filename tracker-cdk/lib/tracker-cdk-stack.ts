import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {  UserPool, UserPoolClient, AccountRecovery, UserPoolDomain, CfnUserPoolGroup} from 'aws-cdk-lib/aws-cognito';

import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';

import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

export class TrackerCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    //#region: Auth / userpool-client-groups
    const userPool= new UserPool( this, 'UserPool',{
      userPoolName: 'gTrackUserPool',
      selfSignUpEnabled: true, //create user through cmd
      signInAliases:{
        email: true,
      },autoVerify:{ //For testing remove before prod
        email: true
      },
      accountRecovery: AccountRecovery.EMAIL_ONLY,

      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY //big red button
    })

    const userpoolClient = new UserPoolClient( this, 'UserPoolClient',{
      userPool,
      generateSecret: false,
      authFlows:{
        userPassword:true,
        userSrp: true,
      }
    })

    new CfnUserPoolGroup(this, 'MembersGroup', {
      groupName: 'members',
      userPoolId: userPool.userPoolId,
    });

    new CfnUserPoolGroup(this, 'TrainersGroup', {
      groupName: 'trainers',
      userPoolId: userPool.userPoolId,
    });

    new CfnUserPoolGroup(this, 'AdminsGroup', {
      groupName: 'admins',
      userPoolId: userPool.userPoolId,
    });

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
    });

    new cdk.CfnOutput(this, 'UserPoolClientId',{
      value: userpoolClient.userPoolClientId
    })
    //#endregion
    
    //#region:: UserProfiles / dynamoDB table 
    const userTable = new dynamodb.Table(this, 'UserProfileTable', {
      tableName: 'UserProfiles',

      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },

      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,

      removalPolicy: cdk.RemovalPolicy.DESTROY, // dev only
    });

    //create profile
    const postConfirmFn = new lambda.Function(this, 'PostConfirmFn', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/post-confirm'),

      environment: {
        TABLE_NAME: userTable.tableName,
      },
    });

    userTable.grantWriteData(postConfirmFn);

    userPool.addTrigger(
      cognito.UserPoolOperation.POST_CONFIRMATION,
      postConfirmFn
    );

    
    //#endregion
  
    //#region: Sessions:  / dynamoDB table / Create-Get-Update-Delete
    const sessionTable = new dynamodb.Table(this, "SessionsTable", {
      tableName: "Sessions",

      partitionKey: {
        name: "userId",
        type: dynamodb.AttributeType.STRING,
      },

      sortKey: {
        name: "sessionId",
        type: dynamodb.AttributeType.STRING,
      },

      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // dev only
    });

    const createSessionFn = new NodejsFunction(this, "CreateSessionFn", {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: "lambda/sessions/create.ts",
      environment: {
        TABLE_NAME: sessionTable.tableName,
      }, bundling: {
        forceDockerBundling: false,
      },
    });
    sessionTable.grantWriteData(createSessionFn);

    const getSessionsFn = new NodejsFunction(this, "GetSessionsFn", {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: "lambda/sessions/get.ts",
      environment: {
        TABLE_NAME: sessionTable.tableName,
      }, bundling: {
        forceDockerBundling: false,
      },
    });
    sessionTable.grantReadData(getSessionsFn);    
    //#endregion
    
    //#region: Exersises:  / dynamoDB table / Create-Get-Update-Delete
      const exersisesTable = new dynamodb.Table(this, "ExersisesTable", {
      tableName: "Exersises",

      partitionKey: {
        name: "exersiseId",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // dev only
    });
    //#endregion

    //#region: Sets:  / dynamoDB table / Create-Get-Update-Delete
      const setsTable = new dynamodb.Table(this, "SetsTable", {
      tableName: "Sets",

      partitionKey: {
        name: "setId",
        type: dynamodb.AttributeType.STRING,
      },sortKey: {
        name: "exersiseId",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // dev only
    });
    //#endregion

  }
}

//#region:
//#endregion