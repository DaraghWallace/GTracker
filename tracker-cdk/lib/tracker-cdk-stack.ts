import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {  UserPool, UserPoolClient, AccountRecovery, UserPoolDomain, CfnUserPoolGroup} from 'aws-cdk-lib/aws-cognito';

import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

export class TrackerCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const scanPath = "lambda/functions/scan.ts"
    const createPath = "lambda/functions/create.ts"
    
    //#region: Auth / userpool-client-groups
    const userPool= new UserPool( this, 'UserPool',{
      userPoolName: 'gTrackUserPool',
      selfSignUpEnabled: true, //create user through cmd
      signInAliases:{email: true},
      customAttributes: {
        nickname: new cognito.StringAttribute({ mutable: true }),
        userType: new cognito.StringAttribute({ mutable: true }),
      },
      autoVerify:{email: true },//For testing remove before prod
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY
    })

    const userpoolClient = new UserPoolClient(this, 'UserPoolClient', {
      userPool,
      generateSecret: false,
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      readAttributes: new cognito.ClientAttributes()
        .withStandardAttributes({ nickname: true, email: true })
        .withCustomAttributes('userType'),
      writeAttributes: new cognito.ClientAttributes()
        .withStandardAttributes({ nickname: true, email: true })
        .withCustomAttributes('userType'),
    });

    const userPId = userPool.userPoolId

    new CfnUserPoolGroup(this, 'MembersGroup', { groupName: 'members', userPoolId: userPId });
    new CfnUserPoolGroup(this, 'TrainersGroup', { groupName: 'trainers', userPoolId: userPId });
    new CfnUserPoolGroup(this, 'AdminsGroup', { groupName: 'admins', userPoolId: userPId });
    new cdk.CfnOutput(this, 'UserPoolId', {  value: userPId });
    
    new cdk.CfnOutput(this, 'UserPoolClientId',{
      value: userpoolClient.userPoolClientId
    })

    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, "GymAuthorizer", {
      cognitoUserPools: [userPool],
    });
    //#endregion
    
    //#region: UserProfiles / dynamoDB table C-r-u-d
    const userTable = new dynamodb.Table(this, 'UserProfileTable', {
      tableName: 'GtUserProfiles',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    //create profile
    const postConfirmFn = new NodejsFunction(this, 'PostConfirmFn', {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: 'lambda/post-confirm/index.ts',
      handler: 'handler',
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
  
    //#region: Sessions:  / dynamoDB table / C-R-u-D
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
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const createSessionFn = new NodejsFunction(this, "CreateSessionFn", {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: createPath,
      environment: {
        TABLE_NAME: sessionTable.tableName,
      }, bundling: {
        forceDockerBundling: false,
      },
    });
    
    sessionTable.grantWriteData(createSessionFn);
    
    sessionTable.addGlobalSecondaryIndex({
      indexName: "userId-index",
      partitionKey: {
        name: "userId",
        type: dynamodb.AttributeType.STRING,
      },
    });

    const scanSessionsFn = new NodejsFunction(this, "GetSessionsFn", {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: scanPath,
      environment: {TABLE_NAME: sessionTable.tableName,},
      bundling: {forceDockerBundling: false,},
    });
    sessionTable.grantReadData(scanSessionsFn);    

    const getSessionsByUserFn = new NodejsFunction(this, "getSessionsByUserFn", {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: "lambda/functions/getByUser.ts",
      environment: { TABLE_NAME: sessionTable.tableName },
      bundling: { forceDockerBundling: false },
    });
    sessionTable.grantReadData(getSessionsByUserFn);    

    const deleteSessionFn = new NodejsFunction(this, "DeleteSessionFn", {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: "lambda/functions/deleteSession.ts",
      environment: { TABLE_NAME: sessionTable.tableName },
      bundling: { forceDockerBundling: false },
    });
    sessionTable.grantWriteData(deleteSessionFn);


    //#endregion
    
    //#region: Exercises:  / dynamoDB table / C-R-u-d
    const exercisesTable = new dynamodb.Table(this, "ExercisesTable", {
      tableName: "Exercises",
      partitionKey: {
        name: "exerciseId",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const createExerciseFn = new NodejsFunction(this, "CreateExerciseFn", {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: createPath,
      environment: {
        TABLE_NAME: exercisesTable.tableName,
      }, bundling: {
        forceDockerBundling: false,
      },
    });
    exercisesTable.grantWriteData(createExerciseFn);

    const getExercisesFn = new NodejsFunction(this, "GetExercisesFn", {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: scanPath,
      environment: {TABLE_NAME: exercisesTable.tableName,},
      bundling: {forceDockerBundling: false,},
    });
    exercisesTable.grantReadData(getExercisesFn);     
    //#endregion

    //#region: SessionExercise:  / dynamoDB table / C-R-u-d
    const sessionExerciseTable = new dynamodb.Table(this, "SessionExerciseTable", {
      tableName: "SessionExercises",
      partitionKey: {
        name: "sessionExerciseId",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    sessionExerciseTable.addGlobalSecondaryIndex({
      indexName: "sessionExerciseId-index",
      partitionKey: {
        name: "sessionExerciseId",
        type: dynamodb.AttributeType.STRING,
      },
    });

    sessionExerciseTable.addGlobalSecondaryIndex({
      indexName: "sessionId-index",
      partitionKey: {
        name: "sessionId",
        type: dynamodb.AttributeType.STRING,
      },
    });

    const createSessionExerciseFn = new NodejsFunction(this, "CreateSessionExerciseFn", {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: createPath,
      environment: {
        TABLE_NAME: sessionExerciseTable.tableName,
      }, bundling: {
        forceDockerBundling: false,
      },
    });
    sessionExerciseTable.grantWriteData(createSessionExerciseFn);

    const getSessionExerciseBySessionFn = new NodejsFunction(this, "getSessionExerciseTableBySessionFn", {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: "lambda/functions/getBySession.ts",
      environment: {TABLE_NAME: sessionExerciseTable.tableName,},
      bundling: {forceDockerBundling: false,},
    });
    sessionExerciseTable.grantReadData(getSessionExerciseBySessionFn);     

    const deleteSessionExerciseFn = new NodejsFunction(this, "DeleteSessionExerciseFn", {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: "lambda/functions/deleteSessionExercise.ts",
      environment: { TABLE_NAME: sessionExerciseTable.tableName },
      bundling: { forceDockerBundling: false },
    });
    sessionExerciseTable.grantWriteData(deleteSessionExerciseFn);
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
    const allSessions = api.root.addResource("sessions-all");
    const sessionById = sessions.addResource("{sessionId}", {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
      },
    });

    sessions.addMethod("POST",new apigateway.LambdaIntegration(createSessionFn),{
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );

    allSessions.addMethod("GET", new apigateway.LambdaIntegration(scanSessionsFn), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    sessions.addMethod("GET",new apigateway.LambdaIntegration(getSessionsByUserFn),{
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );
    //U
    sessionById.addMethod("DELETE", new apigateway.LambdaIntegration(deleteSessionFn), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    const exercises = api.root.addResource("exercises");
    exercises.addMethod("POST", new apigateway.LambdaIntegration(createExerciseFn), {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );
    
    exercises.addMethod("GET", new apigateway.LambdaIntegration(getExercisesFn), {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );
    //U
    //D

    const sessionExercise = api.root.addResource("sessionExercise");
    const sessionExerciseById = sessionExercise.addResource("{sessionExerciseId}", {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
      },
    });
    sessionExercise.addMethod("POST", new apigateway.LambdaIntegration(createSessionExerciseFn), {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );
    sessionExercise.addMethod("GET", new apigateway.LambdaIntegration(getSessionExerciseBySessionFn), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    //U
    sessionExerciseById.addMethod("DELETE", new apigateway.LambdaIntegration(deleteSessionExerciseFn), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    new cdk.CfnOutput(this, "ApiUrl", {value: api.url});
    //#endregion
  
  }
}

//#region:
//#endregion