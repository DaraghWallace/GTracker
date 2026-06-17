import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

interface Props {
  api: apigateway.RestApi;
  authorizer: apigateway.CognitoUserPoolsAuthorizer;
}

export class Exercises extends Construct {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const { api, authorizer } = props;

    // --- Table ---
    const table = new dynamodb.Table(this, "Table", {
      tableName: "Exercises",
      partitionKey: { name: "exerciseId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // --- Lambdas ---
    const createFn = this.fn("CreateFn", "lambda/functions/generic/create.ts", table.tableName);
    const scanFn   = this.fn("ScanFn",   "lambda/functions/scan.ts", table.tableName);
    const updateFn = this.fn("UpdateFn", "lambda/functions/generic/updateItem.ts", table.tableName);
    const deleteFn = this.fn("DeleteFn", "lambda/functions/generic/delete.ts", table.tableName);

    table.grantWriteData(createFn);
    table.grantReadData(scanFn);
    table.grantWriteData(updateFn);
    table.grantWriteData(deleteFn);

    // --- Routes ---
    const exercises    = api.root.addResource("exercises");

    this.addMethod(exercises, "POST", createFn, authorizer);
    this.addMethod(exercises, "GET", scanFn,   authorizer);
    this.addMethod(exercises, "PUT", updateFn, authorizer);
    this.addMethod(exercises, "DELETE", deleteFn, authorizer);
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