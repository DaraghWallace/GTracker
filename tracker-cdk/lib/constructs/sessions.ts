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
  public readonly table: dynamodb.Table;
  constructor(scope: Construct, id: string, props: SessionsProps) {
    super(scope, id);

    const { api, authorizer } = props;

    // --- Table ---
    this.table = new dynamodb.Table(this, "Table", {
      tableName: "Sessions",
      partitionKey: { name: "sessionId", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.table.addGlobalSecondaryIndex({
      indexName: "userId-index",
      partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      sortKey:      { name: "dateDone", type: dynamodb.AttributeType.STRING },
    });

    // --- Lambdas ---
    const createFn = this.fn("CreateFn", "lambda/functions/generic/create.ts", this.table.tableName);
    const getFn    = this.fn("GetFn",    "lambda/functions/getByUser.ts", this.table.tableName);
    const updateFn = this.fn("UpdateFn", "lambda/functions/generic/updateItem.ts", this.table.tableName);
    const deleteFn = this.fn("DeleteFn", "lambda/functions/generic/delete.ts", this.table.tableName);

    this.table.grantWriteData(createFn);
    this.table.grantReadData(getFn);
    this.table.grantReadWriteData(updateFn);
    this.table.grantReadWriteData(deleteFn);

    // --- Routes ---
    const sessions = api.root.addResource("sessions");
    const sessionById = sessions.addResource("{sessionId}");

    this.addMethod(sessions,    "POST",   createFn, authorizer);
    this.addMethod(sessions,    "GET",    getFn,    authorizer);
    this.addMethod(sessionById, "PUT",    updateFn, authorizer);
    this.addMethod(sessionById, "DELETE", deleteFn, authorizer);
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