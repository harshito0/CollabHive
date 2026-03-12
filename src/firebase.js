// Firebase Configuration
// ⚠️  IMPORTANT: Replace the values below with your actual Firebase project credentials.
// How to get them:
// 1. Go to https://console.firebase.google.com
// 2. Create a new project (or select an existing one)
// 3. Go to Project Settings → General → "Your apps" → Web App
// 4. Copy the firebaseConfig object and paste the values here.
//
// Required Auth methods to ENABLE in Firebase Console:
//   Authentication → Sign-in Method:
//     ✅ Google
//     ✅ Phone

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
