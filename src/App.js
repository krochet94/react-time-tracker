import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase-config';
import { GoogleAuthProvider } from 'firebase/auth';
import Login from './components/Login';
import Main from './components/Main';

function App() {
  const [ user ] = useAuthState(auth);
  const provider = new GoogleAuthProvider();

  return (
    <div className="App">
      <section>
        {user ? <Main /> : <Login provider={provider} />}
      </section>
    </div>
  );
}

export default App;
