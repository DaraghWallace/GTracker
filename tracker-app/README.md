# GTracker

A full-stack web application for tracking individual gym sessions. Users can log workouts, record exercises and sets, and review their training history over time.

Built as a portfolio project demonstrating end-to-end AWS serverless architecture and infrastructure-as-code. Security hardening is an ongoing part of the project (see [Security](#security)).

---

## Architecture

```
React (Vite) → API Gateway → Lambda → DynamoDB
                    ↑
              Cognito Authorizer
```

**Frontend:** React + TypeScript, bootstrapped with Vite. Auth handled via AWS Amplify (Cognito).

**Backend:** Serverless REST API built with AWS CDK. Each resource (Sessions, Exercises, SessionExercises, UserProfiles) has its own DynamoDB table and Lambda functions wired to API Gateway routes.

**Auth:** Amazon Cognito User Pool with a Cognito authorizer on every API Gateway method. Handlers read the caller's identity from the verified `sub` claim in the JWT. Ownership checks are implemented per handler (see [Security](#security) for current coverage and known gaps).

---

## Project Structure

```
GTracker/
├── tracker-cdk/          # CDK infrastructure (Lambda, API Gateway, DynamoDB, Cognito)
│   ├── bin/              # CDK app entry point, scripts/sync-env.ts
│   ├── lib/              # Stack and constructs
│   │   └── constructs/   # Auth, Sessions, Exercises, SessionExercises, UserProfiles
│   └── lambda/           # Lambda handler source and unit tests
│       └── functions/
│           ├── generic/       # Shared create, update, delete, get handlers
│           └── coachClients/  # Trainer/client handlers
└── tracker-app/          # React frontend
    └── src/
```

---

## Getting Started

### Prerequisites

- Node.js 22+
- AWS CLI configured with appropriate credentials
- AWS CDK installed globally: `npm install -g aws-cdk`

### Deploy the backend

```bash
cd tracker-cdk
npm install
cdk bootstrap   # first time only
cdk deploy --outputs-file ../tracker-app/src/cdk-outputs.json
```

After deploying, sync the CDK outputs to your frontend environment (run from `tracker-cdk`):

```bash
npx ts-node bin/scripts/sync-env.ts
```

This generates `tracker-app/.env` with the API URL and Cognito IDs from the deployment.

### Run the frontend

```bash
cd tracker-app
npm install
npm run dev
```

### Run tests

```bash
cd tracker-cdk
npm test
```

Current tests are Lambda handler unit tests (DynamoDB mocked). There are no CDK stack tests yet.

---

## Security

This project is a work in progress and a learning exercise. It should be treated as a demo and not used to store sensitive data until the hardening below is finished.

**In place**
- Every API Gateway route requires a valid Cognito JWT.
- Handlers take the caller's identity from the verified token (`requestContext.authorizer.claims.sub`).
- The generic create/update handlers strip any client-supplied `userId` and replace it with the verified identity.
- Sessions are keyed by `sessionId` + `userId`, so session update/delete operate only on the caller's own records.
- Update/delete handlers for session exercises fetch the existing item and check ownership before acting.
- `POST /sessions` validates its request body (field allow-list and length/range limits) at API Gateway.
- The Sessions table is retained if the stack is deleted.

**In progress**
- Ownership and role checks are not yet applied uniformly across every handler and table.
- Request validation is only on `POST /sessions` so far; other routes still need it.
- Role handling, CORS configuration, rate limiting, logging/alerting, backups for the remaining tables, and dependency updates are being reviewed and fixed.

---

## What's Next

- **Security hardening** — finish the items above
- **Coach/client relationships** (in progress) — trainers can view and track their clients' sessions; role handling is being reworked as part of the hardening
- **Cardio tracking** — log cardio sessions alongside weight training
- **Progressive overload insights** — surface trends across sessions (volume, weight, frequency)
- **Mobile experience** — responsive improvements and potential React Native port