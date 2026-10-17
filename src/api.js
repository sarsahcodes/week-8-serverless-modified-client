// Calls the backend (API Gateway -> TasksApiFunction -> DynamoDB) through Amplify's REST client.
// Every request carries the Cognito ID token, which the API's Cognito authorizer validates.
import { get, post, put, del } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { API_NAME } from './amplifyConfig';

async function authHeaders() {
  const { tokens } = await fetchAuthSession();
  if (!tokens?.idToken) throw new Error('Your session has expired. Please sign in again.');
  return { Authorization: tokens.idToken.toString() };
}

function errorMessage(err) {
  const body = err?.response?.body;
  if (body) {
    try {
      return JSON.parse(body).message || body;
    } catch {
      return body;
    }
  }
  return err?.message || 'Request failed';
}

async function request(method, path, { body, queryParams } = {}) {
  const options = { headers: await authHeaders() };
  if (body !== undefined) options.body = body;
  if (queryParams) options.queryParams = queryParams;
  try {
    const res = await method({ apiName: API_NAME, path, options }).response;
    if (res.statusCode === 204) return null;
    const text = await res.body.text();
    return text ? JSON.parse(text) : null;
  } catch (err) {
    throw new Error(errorMessage(err));
  }
}

export const listTasks = (status) =>
  request(get, '/tasks', status ? { queryParams: { status } } : {}).then((data) => data.items);

export const createTask = ({ description, date, deadlineMinutes }) =>
  request(post, '/tasks', { body: { description, date, deadlineMinutes } });

export const updateTask = (taskId, changes) => request(put, `/tasks/${taskId}`, { body: changes });

export const completeTask = (taskId) => updateTask(taskId, { status: 'Completed' });

export const deleteTask = (taskId) => request(del, `/tasks/${taskId}`);
