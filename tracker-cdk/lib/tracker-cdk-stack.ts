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

    //userPool, userpoolClient
    const auth = new Auth(this, 'Auth', { api });

    //table, (C-R-u-d)
    new UserProfiles(this, 'UserProfiles', { userPool: auth.userPool });

    //table, (C-R-U-D)
    new Sessions(this, 'Sessions', { 
      api, 
      authorizer: auth.authorizer 
    });
    
    //table, Lamda(C-R-u-d)
    new Exercises(this, 'Exercises', { 
      api, 
      authorizer: auth.authorizer 
    });

    //table, Lamda(C-R-U-D)
    new SessionExercises(this, 'SessionExercises', { 
      api, 
      authorizer: auth.authorizer 
    });

    new cdk.CfnOutput(this, "ApiUrl", { value: api.url });
  }
}
