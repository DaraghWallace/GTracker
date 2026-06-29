import fs from 'fs';

interface StackOutputs {
  ApiUrl: string;
  UserPoolId: string;
  UserPoolClientId: string;
}

interface OutputsFile {
  TrackerCdkStack: StackOutputs;
}

const fileContents = fs.readFileSync('../tracker-app/src/cdk-outputs.json', 'utf-8');
const outputs: OutputsFile = JSON.parse(fileContents);
const stackOutputs = outputs.TrackerCdkStack;

const envContent = `VITE_API_URL=${stackOutputs.ApiUrl}
VITE_USER_POOL_ID=${stackOutputs.UserPoolId}
VITE_USER_POOL_CLIENT_ID=${stackOutputs.UserPoolClientId}
`;

fs.writeFileSync('../tracker-app/.env', envContent);

console.log('.env file updated successfully');
//npx ts-node scripts/sync-env.ts