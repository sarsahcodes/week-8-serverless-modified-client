// Registers the Cognito User Pool (Auth) and the REST API (API) with Amplify.
// Every value comes from a Vite environment variable (VITE_*), which is set:
//   - on Amplify Hosting: by the backend SAM template (AWS::Amplify::App EnvironmentVariables)
//   - locally: in .env.local, written by `npm run env:sync` (sam list stack-outputs)
const env = import.meta.env;

export const API_NAME = 'TodoApi';

const REQUIRED = ['VITE_AWS_REGION', 'VITE_USER_POOL_ID', 'VITE_USER_POOL_CLIENT_ID', 'VITE_API_URL'];
export const missingEnv = REQUIRED.filter((key) => !env[key]);

export const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: env.VITE_USER_POOL_ID,
      userPoolClientId: env.VITE_USER_POOL_CLIENT_ID,
      loginWith: { email: true },
      signUpVerificationMethod: 'code',
      userAttributes: { email: { required: true } },
      // Mirrors the User Pool password policy so the form validates before submitting.
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: false,
      },
    },
  },
  API: {
    REST: {
      [API_NAME]: {
        endpoint: (env.VITE_API_URL || '').replace(/\/+$/, ''),
        region: env.VITE_AWS_REGION,
      },
    },
  },
};
