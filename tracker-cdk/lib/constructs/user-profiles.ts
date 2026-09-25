import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { UserPool } from 'aws-cdk-lib/aws-cognito';

interface UserProfilesProps {
  userPool: UserPool;
  api: apigateway.RestApi;
  authorizer: apigateway.CognitoUserPoolsAuthorizer;
}

export class UserProfiles extends Construct {
  public readonly table: dynamodb.Table;
  public readonly clientsResource: apigateway.Resource;
  public readonly coachingResource: apigateway.Resource;


  constructor(scope: Construct, id: string, props: UserProfilesProps) {
    super(scope, id);
    const { userPool, api, authorizer } = props;

    // --- Table ---
    this.table = new dynamodb.Table(this, 'Table', {
      tableName: 'GtUserProfiles',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.table.addGlobalSecondaryIndex({
      indexName: "currentTrainerId-index",
      partitionKey: { name: "currentTrainerId", type: dynamodb.AttributeType.STRING },
    });

    // --- Post-confirm trigger (unchanged) ---
    const postConfirmFn = new NodejsFunction(this, 'PostConfirmFn', {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: 'lambda/post-confirm/index.ts',
      handler: 'handler',
      environment: { TABLE_NAME: this.table.tableName },
    });
    this.table.grantWriteData(postConfirmFn);
    userPool.addTrigger(cognito.UserPoolOperation.POST_CONFIRMATION, postConfirmFn);

    // --- Lambdas ---
    const getFn = new NodejsFunction(this, 'GetFn', {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: 'lambda/functions/generic/getItem.ts',
      environment: {
        TABLE_NAME: this.table.tableName,
        PARTITION_KEY_NAME: 'userId',
        OWNERSHIP_FIELD: 'userId',
        IS_PUBLIC: 'false',
      },
      bundling: { forceDockerBundling: false },
    });

    const findByEmailFn = new NodejsFunction(this, 'FindByEmailFn', {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: 'lambda/functions/coachClients/findByEmail.ts',
      environment: { TABLE_NAME: this.table.tableName },
      bundling: { forceDockerBundling: false },
    });

    const addClientFn = new NodejsFunction(this, 'AddClientFn', {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: 'lambda/functions/coachClients/addClient.ts',
      environment: { USER_PROFILES_TABLE: this.table.tableName },
      bundling: { forceDockerBundling: false },
    });

    const removeClientFn = new NodejsFunction(this, 'RemoveClientFn', {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: 'lambda/functions/coachClients/removeClient.ts',
      environment: { USER_PROFILES_TABLE: this.table.tableName },
      bundling: { forceDockerBundling: false },
    });

    const listClientsFn = new NodejsFunction(this, 'ListClientsFn', {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: 'lambda/functions/coachClients/listClients.ts',
      environment: { TABLE_NAME: this.table.tableName },
      bundling: { forceDockerBundling: false },
    });

    this.table.grantReadData(getFn);
    this.table.grantReadData(findByEmailFn);
    this.table.grantReadWriteData(addClientFn);
    this.table.grantReadWriteData(removeClientFn);
    this.table.grantReadData(listClientsFn);

    // --- Routes ---
    const users = api.root.addResource('users');
    this.addMethod(users.addResource('{id}'), 'GET', getFn, authorizer);

    const coaching = api.root.addResource('coaching');
    this.addMethod(coaching.addResource('find-user'), 'GET', findByEmailFn, authorizer);
    this.addMethod(coaching.addResource('add-client'), 'POST', addClientFn, authorizer);
    this.addMethod(coaching.addResource('remove-client'), 'POST', removeClientFn, authorizer);
    // this.addMethod(coaching.addResource('clients'), 'GET', listClientsFn, authorizer);

    const clientsResource = coaching.addResource('clients');
    this.addMethod(clientsResource, 'GET', listClientsFn, authorizer);
    this.clientsResource = clientsResource;
    this.coachingResource = coaching;
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
