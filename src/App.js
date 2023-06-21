import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase-config';
import { GoogleAuthProvider } from 'firebase/auth';
import Login from './components/Login';
import Main from './components/Main';

function App() {
  const [fullLoading, setFullLoading] = useState(true);
  const [ user ] = useAuthState(auth);
  const provider = new GoogleAuthProvider();

  useEffect(() => {
    setFullLoading(true);    
    setTimeout(() => {
      setFullLoading(false);
    }, 1500);
  }, [user]);

  return (
    <div className="App">
      <section>
        {/* shows the login page when user is not logged in and the main page when already logged in */}
        {user ? <Main /> : <Login provider={provider} fullLoading={fullLoading} />}
      </section>
    </div>
  );
}

export default App;
