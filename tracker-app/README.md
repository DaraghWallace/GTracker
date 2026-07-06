# GTracker

A full-stack web application for tracking individual gym sessions. Users can log workouts, record exercises and sets, and review their training history over time.

Built as a portfolio project demonstrating end-to-end AWS serverless architecture, infrastructure-as-code, and secure API design.

---

## Architecture

```
React (Vite) → API Gateway → Lambda → DynamoDB
                    ↑
              Cognito Authorizer
```

**Frontend:** React + TypeScript, bootstrapped with Vite. Auth handled via AWS Amplify (Cognito).

**Backend:** Serverless REST API built with AWS CDK. Each resource (Sessions, Exercises, SessionExercises) has its own DynamoDB table and Lambda functions wired to API Gateway routes.

**Auth:** Amazon Cognito User Pool with a per-route Cognito authorizer on every API Gateway method. Lambda handlers verify ownership on every read/write using the verified `sub` claim from the JWT — not client-supplied IDs.

---

## Project Structure

```
GTracker/
├── tracker-cdk/          # CDK infrastructure (Lambda, API Gateway, DynamoDB, Cognito)
│   ├── bin/              # CDK app entry point
│   ├── lib/              # Stack and constructs
│   │   └── constructs/   # Auth, Sessions, Exercises, SessionExercises, UserProfiles
│   ├── lambda/           # Lambda handler source
│   │   └── functions/
│   │       └── generic/  # Shared create, update, delete handlers
│   └── test/             # CDK and unit tests
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

After deploying, sync the CDK outputs to your frontend environment:

```bash
npx ts-node scripts/sync-env.ts
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

---

## Security

- Every API Gateway route requires a valid Cognito JWT
- Lambda handlers extract the caller's identity from the verified token (`requestContext.authorizer.claims.sub`), never from client-supplied parameters
- Write operations (update, delete) fetch the existing item and verify ownership before acting
- Client-supplied `userId` fields are stripped from request bodies and replaced with the verified identity

---

## What's Next

- **Cardio tracking** — log cardio sessions alongside weight training
- **Coach/client relationships** — trainers can view and track their clients' sessions, with role-based access control via Cognito groups
- **Progressive overload insights** — surface trends across sessions (volume, weight, frequency)
- **Mobile experience** — responsive improvements and potential React Native port