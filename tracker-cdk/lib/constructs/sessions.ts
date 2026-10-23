import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

interface SessionsProps {
  api: apigateway.RestApi;
  authorizer: apigateway.CognitoUserPoolsAuthorizer;
  userProfilesTable: dynamodb.Table;
  clientsResource: apigateway.Resource;
}

export class Sessions extends Construct {
  // SessionExercises can READ this table to verify session ownership
  public readonly table: dynamodb.Table;
  constructor(scope: Construct, id: string, props: SessionsProps) {
    super(scope, id);

    const { api, authorizer, userProfilesTable, clientsResource  } = props;

    // --- Table ---
    this.table = new dynamodb.Table(this, "Table", {
      tableName: "Sessions",
      partitionKey: { name: "sessionId", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Used by getByUser.ts (date range queries) and getClientLatestSession.ts.
    this.table.addGlobalSecondaryIndex({
      indexName: "userId-index",
      partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      sortKey:      { name: "dateDone", type: dynamodb.AttributeType.STRING },
    });

    // --- Lambdas ---
    // NOTE: create/update/delete use the SHARED "generic" functions
    const createFn = this.fn("CreateFn", "lambda/functions/generic/create.ts", this.table.tableName);
    const getFn    = this.fn("GetFn",    "lambda/functions/getByUser.ts", this.table.tableName);
    const updateFn = this.fn("UpdateFn", "lambda/functions/generic/updateItem.ts", this.table.tableName);
    const deleteFn = this.fn("DeleteFn", "lambda/functions/generic/delete.ts", this.table.tableName);

    this.table.grantWriteData(createFn);
    this.table.grantReadData(getFn);
    this.table.grantReadWriteData(updateFn);
    this.table.grantReadWriteData(deleteFn);

    // Creates a session on behalf of a client.
    const createForClientFn = new NodejsFunction(this, "CreateForClientFn", {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: "lambda/functions/coachClients/createSessionForClient.ts",
      environment: {
        SESSIONS_TABLE: this.table.tableName,
        USER_PROFILES_TABLE: userProfilesTable.tableName,
      },
      bundling: { forceDockerBundling: false },
    });

    // writes sessions; reads profiles (to check currentTrainerId matches the caller)
    this.table.grantWriteData(createForClientFn);
    userProfilesTable.grantReadData(createForClientFn);

    // Trainer reads a client's most recent session.
    const getLatestSessionFn = new NodejsFunction(this, "GetLatestSessionFn", {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: "lambda/functions/coachClients/getClientLatestSession.ts",
      environment: {
        SESSIONS_TABLE: this.table.tableName,
        USER_PROFILES_TABLE: userProfilesTable.tableName,
      },
      bundling: { forceDockerBundling: false },
    });

    this.table.grantReadData(getLatestSessionFn);
    userProfilesTable.grantReadData(getLatestSessionFn);

    const clientById = clientsResource.addResource("{clientId}");
    this.addMethod(clientById.addResource("latest-session"), "GET", getLatestSessionFn, authorizer);


    // --- Validation ---
    const validator = api.addRequestValidator("SessionBodyValidator", {
      validateRequestBody: true,
    });

    // POST /sessions
    // If the body breaks a rule, returns 400
    const createSessionModel = api.addModel("CreateSessionModel", {
      contentType: "application/json",
      schema: {
        schema: apigateway.JsonSchemaVersion.DRAFT4,
        type: apigateway.JsonSchemaType.OBJECT,

        required: ["dateDone"],   // >> this field MUST be present.
        properties: {             // >> Limits/rules per field:
          sessionId:  { type: apigateway.JsonSchemaType.STRING, maxLength: 36 },      // >> a uuid is 36 chars
          userId:     { type: apigateway.JsonSchemaType.STRING, maxLength: 64 },      // >> allowed because the frontend sends it; Lambda throws it away
          dateDone:   { type: apigateway.JsonSchemaType.STRING, maxLength: 10 },      // >> "YYYY-MM-DD"
          userWeight: { type: apigateway.JsonSchemaType.NUMBER, minimum: 0, maximum: 500 },
          focus: {                                                                    // Either Array or null
            type: [apigateway.JsonSchemaType.STRING, apigateway.JsonSchemaType.NULL],
            maxLength: 50,
          },
          notes: {
            type: [apigateway.JsonSchemaType.STRING, apigateway.JsonSchemaType.NULL],
            maxLength: 500,
          },
        },
        // any field NOT listed in "properties" is rejected.
        additionalProperties: false,
      },
    });

    // POST /sessions/for-client  (trainer creates a session for a client)
    // Different body from the normal create: the frontend (ClientSessionForm.tsx)
    // sends { clientId, focus, date } - note "date", not "dateDone".
    const createClientSessionModel = api.addModel("CreateClientSessionModel", {
      contentType: "application/json",
      schema: {
        schema: apigateway.JsonSchemaVersion.DRAFT4,
        type: apigateway.JsonSchemaType.OBJECT,

        // The Lambda copies "date" straight into dateDone, which is the sort key of
        // the userId-index. DynamoDB rejects an empty/missing key value (500), so
        // require a real YYYY-MM-DD date here.
        required: ["clientId", "date"],
        properties: {
          clientId: { type: apigateway.JsonSchemaType.STRING, minLength: 1, maxLength: 64 },
          date: {
            type: apigateway.JsonSchemaType.STRING,
            maxLength: 10,
            pattern: "^\\d{4}-\\d{2}-\\d{2}$",
          },
          focus: {
            type: [apigateway.JsonSchemaType.STRING, apigateway.JsonSchemaType.NULL],
            maxLength: 50,
          },
        },
        // Allow-list: the Lambda spreads every extra field into the stored item
        // (...sessionData), so unknown fields must be rejected here.
        additionalProperties: false,
      },
    });

    // PUT /sessions/{sessionId}
    // Matches what SessionEle.tsx sends: the whole session object.
    // IMPORTANT: updateItem.ts replaces the WHOLE item (PutItem), so a body that
    // leaves a field out deletes that field from the stored session.
    const updateSessionModel = api.addModel("UpdateSessionModel", {
      contentType: "application/json",
      schema: {
        schema: apigateway.JsonSchemaVersion.DRAFT4,
        type: apigateway.JsonSchemaType.OBJECT,

        // dateDone is the userId-index sort key: if it went missing the session
        // would silently drop out of every date-range query.
        required: ["dateDone", "userWeight"],
        properties: {
          sessionId:  { type: apigateway.JsonSchemaType.STRING, maxLength: 36 },      // >> allowed (frontend sends it); key comes from the URL path
          userId:     { type: apigateway.JsonSchemaType.STRING, maxLength: 64 },      // >> allowed (frontend sends it); Lambda throws it away
          userWeight: { type: apigateway.JsonSchemaType.NUMBER, minimum: 0, maximum: 500 },
          // Stored dateDone values are full ISO timestamps (create.ts uses
          // new Date().toISOString(), 24 chars), unlike the 10-char date on create.
          // The pattern has no "$" so both "2026-10-21" and the ISO form pass.
          dateDone: {
            type: apigateway.JsonSchemaType.STRING,
            maxLength: 30,
            pattern: "^\\d{4}-\\d{2}-\\d{2}",
          },
          focus: {
            type: [apigateway.JsonSchemaType.STRING, apigateway.JsonSchemaType.NULL],
            maxLength: 50,
          },
          notes: {
            type: [apigateway.JsonSchemaType.STRING, apigateway.JsonSchemaType.NULL],
            maxLength: 500,
          },
        },
        additionalProperties: false,
      },
    });


    // --- Routes ---
    // /sessions                 (POST create, GET list)
    // /sessions/for-client      (POST, trainer)
    // /sessions/{sessionId}     (PUT update, DELETE delete)
    const sessions = api.root.addResource("sessions");
    const sessionById = sessions.addResource("{sessionId}");

    this.addMethod(sessions, "POST", createFn, authorizer, createSessionModel, validator);
    this.addMethod(sessions.addResource("for-client"), "POST", createForClientFn, authorizer, createClientSessionModel, validator);
    this.addMethod(sessions,    "GET",    getFn,    authorizer ); // no body. Query strings (startDate/endDate) can't be format-checked here; see getByUser.ts
    this.addMethod(sessionById, "PUT",    updateFn, authorizer, updateSessionModel, validator);
    this.addMethod(sessionById, "DELETE", deleteFn, authorizer); // nothing to validate.
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
    authorizer: apigateway.CognitoUserPoolsAuthorizer,
    requestModel?: apigateway.Model,
    validator?: apigateway.RequestValidator
  ) {
    resource.addMethod(method, new apigateway.LambdaIntegration(fn), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
      ...(requestModel && validator
        ? {
            requestValidator: validator,
            requestModels: { "application/json": requestModel },
          }
        : {}),
    });
  }
}