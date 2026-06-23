import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

interface SessionExercisesProps {
  api: apigateway.RestApi;
  authorizer: apigateway.CognitoUserPoolsAuthorizer;
  sessionsTable: dynamodb.Table;
}

export class SessionExercises extends Construct {
  constructor(scope: Construct, id: string, props: SessionExercisesProps) {
    super(scope, id);

    const { api, authorizer , sessionsTable} = props;

    const table = new dynamodb.Table(this, "Table", {
      tableName: "SessionExercises",
      partitionKey: { name: "sessionExerciseId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    table.addGlobalSecondaryIndex({
      indexName: "sessionId-index",
      partitionKey: { name: "sessionId", type: dynamodb.AttributeType.STRING },
    });

    // --- Lambdas ---
    const createFn = this.fn("CreateFn", "lambda/functions/generic/create.ts", table.tableName);
    const getFn =    this.fn("GetFn", "lambda/functions/getBySession.ts", table.tableName, props.sessionsTable.tableName);
    const updateFn = this.fn("UpdateFn", "lambda/functions/generic/updateItem.ts", table.tableName);
    const deleteFn = this.fn("DeleteFn", "lambda/functions/generic/delete.ts", table.tableName);

    table.grantWriteData(createFn);
    table.grantReadData(getFn);
    props.sessionsTable.grantReadData(getFn);
    table.grantReadWriteData(updateFn);
    table.grantReadWriteData(deleteFn);

    // --- Routes ---
    const sessionExercise = api.root.addResource("sessionExercise");

    this.addMethod(sessionExercise, "POST",   createFn, authorizer);
    this.addMethod(sessionExercise, "GET",    getFn,    authorizer);
    this.addMethod(sessionExercise, "PUT",    updateFn, authorizer);
    this.addMethod(sessionExercise, "DELETE", deleteFn, authorizer);
  }

  private fn(id: string, entry: string, tableName: string, otherTableName?: string) {
    return new NodejsFunction(this, id, {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry,
      environment: { 
        TABLE_NAME: tableName, 
        ...(otherTableName ? { OTHER_TABLE: otherTableName } : {})
      },
      bundling: { forceDockerBundling: false },
    });
  }

  private addMethod(
    resource: apigateway.Resource,
    method: string,
    fn: NodejsFunction,
    authorizer: apigateway.CognitoUserPoolsAuthorizer
  ) {
    resource.addMethod(method, new apigateway.LambdaIntegration(fn), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
  }
}