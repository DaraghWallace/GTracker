import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { UserPool, UserPoolClient, AccountRecovery, CfnUserPoolGroup } from 'aws-cdk-lib/aws-cognito';
import * as cognito from 'aws-cdk-lib/aws-cognito';

interface AuthProps {
  api: apigateway.RestApi;
}

export class Auth extends Construct {
  public readonly userPool: UserPool;
  public readonly authorizer: apigateway.CognitoUserPoolsAuthorizer;
  public readonly userPoolClient: UserPoolClient;

  constructor(scope: Construct, id: string, props: AuthProps) {
    super(scope, id);

    this.userPool = new UserPool(this, 'UserPool', {
      userPoolName: 'gTrackUserPool',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      customAttributes: {
        nickname: new cognito.StringAttribute({ mutable: true }),
        userType: new cognito.StringAttribute({ mutable: true }),
      },
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.userPoolClient = new UserPoolClient(this, 'UserPoolClient', {
      userPool: this.userPool,
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

    const userPId = this.userPool.userPoolId;
    new CfnUserPoolGroup(this, 'MembersGroup',  { groupName: 'members',  userPoolId: userPId });
    new CfnUserPoolGroup(this, 'TrainersGroup', { groupName: 'trainers', userPoolId: userPId });
    new CfnUserPoolGroup(this, 'AdminsGroup',   { groupName: 'admins',   userPoolId: userPId });

    new cdk.CfnOutput(this, 'UserPoolId',     { value: userPId });
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: this.userPoolClient.userPoolClientId });

    this.authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'GymAuthorizer', {
      cognitoUserPools: [this.userPool],
    });

    this.authorizer._attachToApi(props.api);
  }
}