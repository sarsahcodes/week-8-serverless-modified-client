# Serverless To-Do — client (React + Amplify)

React (Vite) client for the serverless To-Do app. It uses AWS Amplify to

- **sign up / sign in** against the Cognito User Pool (`Authenticator` component), and
- **call the tasks REST API** (API Gateway → `TasksApiFunction` → DynamoDB) with the user's Cognito ID token.

Server (AWS SAM): <https://github.com/sarsahcodes/week-8-serverless-modified-server>

## Hosting

The site is hosted on **AWS Amplify Hosting**. The Amplify app, its branch, its build settings and its environment variables are all defined in the server's SAM template (`AmplifyApp`, `AmplifyBranch`), so there is nothing to configure by hand. Every push to `main` rebuilds and redeploys the site.

## Configuration

Amplify is configured in [`src/amplifyConfig.js`](src/amplifyConfig.js) (Cognito registration + REST API registration) from four environment variables:

| Variable | Server stack output |
|---|---|
| `VITE_AWS_REGION` | `Region` |
| `VITE_USER_POOL_ID` | `UserPoolId` |
| `VITE_USER_POOL_CLIENT_ID` | `UserPoolClientId` |
| `VITE_API_URL` | `ApiUrl` |

- **Amplify Hosting:** set on the Amplify app by the SAM template.
- **Locally:** `npm run env:sync` writes `.env.local` from the stack outputs using `sam list stack-outputs` (needs the SAM CLI and AWS credentials). Or copy `.env.example` to `.env.local` and fill it in.

## Run locally

```bash
npm install
npm run env:sync                                       # dev stack: serverless-todo-dev
npm run env:sync -- serverless-todo-prod eu-central-1  # or another stack / region
npm run dev                                            # http://localhost:5173
```

## Features

- Sign up (auto-confirmed) and sign in with email + password
- Create tasks with a due date and an expiry deadline (default 5 minutes)
- Pending / Completed / Expired tabs with live countdowns
- Edit or complete Pending tasks, delete any task
- Refreshes every 15 seconds so expiries done by the backend show up
