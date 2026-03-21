import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDLL0HQKJC-378FT3VLxz-ZAABb89rtMcY",
  authDomain: "sae-auditions-915fd.firebaseapp.com",
  projectId: "sae-auditions-915fd",
  storageBucket: "sae-auditions-915fd.firebasestorage.app",
  messagingSenderId: "830723273302",
  appId: "1:830723273302:web:f95fdcd71b3e39e2f3c1f7",
  measurementId: "G-PMLJV32D4D"
};

// Intentionally ignoring errors if placeholders are used so development can proceed visually
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.warn("Firebase not configured properly. Update firebaseConfig in firebase.js");
}

export const auth = app ? getAuth(app) : null;
export const provider = app ? new GoogleAuthProvider() : null;
export const db = app ? getFirestore(app) : null;
