import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import TaskBoard from './components/TaskBoard';

const authComponents = {
  Header() {
    return (
      <div className="auth-header">
        <div className="logo" aria-hidden="true">✓</div>
        <h1>To-Do</h1>
        <p>Tasks that remind you when time runs out.</p>
      </div>
    );
  },
};

export default function App() {
  const { authStatus, user, signOut } = useAuthenticator((ctx) => [ctx.authStatus, ctx.user]);

  if (authStatus !== 'authenticated') {
    return (
      <main className="auth-page">
        <Authenticator components={authComponents} />
      </main>
    );
  }

  return <TaskBoard email={user?.signInDetails?.loginId} onSignOut={signOut} />;
}
