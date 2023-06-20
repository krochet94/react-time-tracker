import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

let firebaseConfig = {
    apiKey: "AIzaSyA2ic2HuZXoA9mVQKefIXil_djcwZenocU",
    authDomain: "time-tracker-react-278d0.firebaseapp.com",
    projectId: "time-tracker-react-278d0",
    storageBucket: "time-tracker-react-278d0.appspot.com",
    messagingSenderId: "565969998645",
    appId: "1:565969998645:web:6b06487018ad917d5d327c"
};

// Initialize Firebase & Firebase services
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

export { firebaseApp, db, auth }
