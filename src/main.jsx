import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import './styles.css';

import { amplifyConfig, missingEnv } from './amplifyConfig';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

if (missingEnv.length) {
  root.render(
    <main className="config-error">
      <h1>Missing configuration</h1>
      <p>Set these environment variables (see <code>.env.example</code>):</p>
      <ul>{missingEnv.map((k) => <li key={k}><code>{k}</code></li>)}</ul>
    </main>,
  );
} else {
  Amplify.configure(amplifyConfig);
  root.render(
    <React.StrictMode>
      <Authenticator.Provider>
        <App />
      </Authenticator.Provider>
    </React.StrictMode>,
  );
}
