import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

interface SessionsProps {
  api: apigateway.RestApi;
  authorizer: apigateway.CognitoUserPoolsAuthorizer;
}

export class Sessions extends Construct {
  constructor(scope: Construct, id: string, props: SessionsProps) {
    super(scope, id);

    const { api, authorizer } = props;

    // --- Table ---
    const table = new dynamodb.Table(this, "Table", {
      tableName: "Sessions",
      partitionKey: { name: "sessionId", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    table.addGlobalSecondaryIndex({
      indexName: "userId-index",
      partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      sortKey:      { name: "dateDone", type: dynamodb.AttributeType.STRING },
    });

    // --- Lambdas ---
    const createFn = this.fn("CreateFn", "lambda/functions/generic/create.ts", table.tableName);
    const getFn    = this.fn("GetFn",    "lambda/functions/getByUser.ts", table.tableName);
    // const scanFn   = this.fn("ScanFn",   "lambda/functions/scan.ts", table.tableName); Remove
    const updateFn = this.fn("UpdateFn", "lambda/functions/generic/updateItem.ts", table.tableName);
    // const deleteFn = this.fn("DeleteFn", "lambda/functions/deleteSession.ts", table.tableName); Remove
    const deleteFn = this.fn("DeleteFn", "lambda/functions/generic/delete.ts", table.tableName);

    table.grantWriteData(createFn);
    table.grantReadData(getFn);
    // table.grantReadData(scanFn);
    table.grantWriteData(updateFn);
    table.grantWriteData(deleteFn);

    // --- Routes ---
    const sessions    = api.root.addResource("sessions");
    // const allSessions = api.root.addResource("sessions-all");

    this.addMethod(sessions,    "POST",   createFn, authorizer);
    this.addMethod(sessions,    "GET",    getFn,    authorizer);
    // this.addMethod(allSessions, "GET",    scanFn,   authorizer);
    this.addMethod(sessions,        "PUT",    updateFn, authorizer);
    this.addMethod(sessions,        "DELETE", deleteFn, authorizer);
  }

  private fn(id: string, entry: string, tableName: string) {
    return new NodejsFunction(this, id, {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry,
      environment: { TABLE_NAME: tableName },
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