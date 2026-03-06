import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {  UserPool, UserPoolClient, AccountRecovery, UserPoolDomain, CfnUserPoolGroup} from 'aws-cdk-lib/aws-cognito';

import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';

import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

// import { LambdaRestApi, LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
// import { HttpMethod } from 'aws-cdk-lib/aws-events';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { ResponseHeadersPolicy } from 'aws-cdk-lib/aws-cloudfront';


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
    
    //#region: UserProfiles / dynamoDB table 
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
        name: "sessionId",
        type: dynamodb.AttributeType.STRING,
      },

      sortKey: {
        name: "userId",
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
      environment: {TABLE_NAME: sessionTable.tableName,},
      bundling: {forceDockerBundling: false,},
    });
    sessionTable.grantReadData(getSessionsFn);    
    //#endregion
    
    //#region: Exercises:  / dynamoDB table / Create-Read-Update-Delete
    const exercisesTable = new dynamodb.Table(this, "ExercisesTable", {
      tableName: "Exercises",
      partitionKey: {
        name: "exerciseId",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // dev only
    });

    const createExerciseFn = new NodejsFunction(this, "CreateExerciseFn", {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: "lambda/exercises/create.ts",
      environment: {
        TABLE_NAME: exercisesTable.tableName,
      }, bundling: {
        forceDockerBundling: false,
      },
    });
    exercisesTable.grantWriteData(createExerciseFn);

    const getExercisesFn = new NodejsFunction(this, "GetExercisesFn", {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: "lambda/exercises/get.ts",
      environment: {TABLE_NAME: exercisesTable.tableName,},
      bundling: {forceDockerBundling: false,},
    });
    exercisesTable.grantReadData(getExercisesFn);     
    //#endregion

    //#region: Sets:  / dynamoDB table / Create-Read-Update-Delete
      const setsTable = new dynamodb.Table(this, "SetsTable", {
      tableName: "Sets",

      partitionKey: {
        name: "setId",
        type: dynamodb.AttributeType.STRING,
      },sortKey: {
        name: "exerciseId",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // dev only
    });
    //#endregion

    //#region: RestAPI
    const api = new apigateway.RestApi(this, "TrackerApi", {
      restApiName: "Gym Track Service",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
      },
    })

    const sessions = api.root.addResource("sessions");
    sessions.addMethod("POST", new apigateway.LambdaIntegration(createSessionFn)); //Working
    sessions.addMethod("GET", new apigateway.LambdaIntegration(getSessionsFn));
    //U
    //D

    const exercises = api.root.addResource("exercises");
    exercises.addMethod("POST", new apigateway.LambdaIntegration(createExerciseFn)); //Working
    exercises.addMethod("GET", new apigateway.LambdaIntegration(getExercisesFn));
    //U
    //D

    const sets = api.root.addResource("sets");
    //C
    //R
    //U
    //D

    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url,
    });
    //#endregion
  }
}

//#region:
//#endregion