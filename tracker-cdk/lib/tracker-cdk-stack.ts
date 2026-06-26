import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

import { Construct } from 'constructs';
import { Auth } from './constructs/auth';
import { UserProfiles } from './constructs/user-profiles';
import { Sessions } from './constructs/sessions';
import { Exercises } from "./constructs/exercises";
import { SessionExercises } from "./constructs/sessionExercises";

export class TrackerCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new apigateway.RestApi(this, "TrackerApi", {
      restApiName: "Gym Track Service",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
      },
    });



    // Obfiscation
    const responseTypes = [
      apigateway.ResponseType.DEFAULT_4XX,
      apigateway.ResponseType.DEFAULT_5XX,
    ];

    //remove headers
    for (const responseType of responseTypes) {
      api.addGatewayResponse(`Strip${responseType.responseType}`, {
        type: responseType,
        responseHeaders: {
          'x-amzn-RequestId': "''",
          'x-amzn-ErrorType': "''",
          'x-amz-apigw-id': "''",
        },
      });
    }

    //userPool, userpoolClient
    const auth = new Auth(this, 'Auth', { api });

    new cdk.CfnOutput(this, "ApiUrl", { value: api.url });
    new cdk.CfnOutput(this, "UserPoolId", { value: auth.userPool.userPoolId });
    new cdk.CfnOutput(this, "UserPoolClientId", { value: auth.userPoolClient.userPoolClientId });

    //table,
    new UserProfiles(this, 'UserProfiles', { userPool: auth.userPool });

    //table, (c-r-u-d)
    const sessions = new Sessions(this, 'Sessions', { 
      api, 
      authorizer: auth.authorizer 
    });
    
    //table, Lamda(c-r-u-d)
    new Exercises(this, 'Exercises', { 
      api, 
      authorizer: auth.authorizer 
    });

    //table, Lamda(read by session)
    new SessionExercises(this, 'SessionExercises', { 
      api, 
      authorizer: auth.authorizer,
      sessionsTable: sessions.table
    });
  }
}
