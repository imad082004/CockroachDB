import { initializeApp, getApps } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app;
let db;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  // Fix for Next.js Turbopack WebSocket issues causing "client is offline" errors
  db = initializeFirestore(app, { experimentalForceLongPolling: true });
} else {
  app = getApps()[0];
  db = getFirestore(app);
}

const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
