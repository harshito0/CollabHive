// Firebase Configuration
// ⚠️  To enable REAL auth, replace the values below with your Firebase project credentials.
// Get them from: https://console.firebase.google.com → Project Settings → Web App

import { initializeApp } from 'firebase/app';
import { getAuth, GithubAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCq0Rt1pdX_TFQmOLXkFgRnkd142Vl06UY",
  authDomain: "collabhive-72364.firebaseapp.com",
  projectId: "collabhive-72364",
  storageBucket: "collabhive-72364.firebasestorage.app",
  messagingSenderId: "700567467111",
  appId: "1:700567467111:web:c5265cc3b2301664dd10c2",
  measurementId: "G-477D4SMV1P"
};

// Check if real credentials have been added
export const isFirebaseConfigured =
  firebaseConfig.apiKey !== "YOUR_API_KEY" &&
  firebaseConfig.projectId !== "YOUR_PROJECT_ID";

let auth = null;
let db = null;

if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    console.warn('Firebase init failed:', e.message);
  }
}

const githubProvider = new GithubAuthProvider();
// Request additional scopes for repository information
githubProvider.addScope('repo');
githubProvider.addScope('read:user');

export { auth, db, githubProvider };
