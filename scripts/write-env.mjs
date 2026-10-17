// Writes .env.local from the backend stack outputs, using the SAM CLI.
//
//   npm run env:sync                                   -> serverless-todo-dev in eu-central-1
//   npm run env:sync -- serverless-todo-prod eu-central-1
//
// Runs `sam list stack-outputs`, so it needs the SAM CLI and AWS credentials.
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const [stackName = 'serverless-todo-dev', region = 'eu-central-1'] = process.argv.slice(2);

const raw = execSync(`sam list stack-outputs --stack-name ${stackName} --region ${region} --output json`, {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'inherit'],
});
const outputs = Object.fromEntries(JSON.parse(raw).map((o) => [o.OutputKey, o.OutputValue]));

const env = {
  VITE_AWS_REGION: outputs.Region,
  VITE_USER_POOL_ID: outputs.UserPoolId,
  VITE_USER_POOL_CLIENT_ID: outputs.UserPoolClientId,
  VITE_API_URL: outputs.ApiUrl,
};
const missing = Object.entries(env).filter(([, value]) => !value);
if (missing.length) {
  console.error(`Stack ${stackName} is missing outputs for: ${missing.map(([key]) => key).join(', ')}`);
  process.exit(1);
}

const lines = Object.entries(env).map(([key, value]) => `${key}=${value}`);
const target = fileURLToPath(new URL('../.env.local', import.meta.url));
writeFileSync(target, `${lines.join('\n')}\n`);
console.log(`Wrote ${target}`);
lines.forEach((line) => console.log(`  ${line}`));
