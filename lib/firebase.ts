import { initializeApp, getApps, getApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { connectStorageEmulator, getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
// const db = getFirestore(app);
// const storage = getStorage(app);

// export { app, db, storage };
// Initialize Firebase
 const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
 const storage = getStorage(app)
// const functions = getFunctions(app);
// const db = getFirestore(app)

// connectFirestoreEmulator(db, "127.0.0.1", 8080);
// connectStorageEmulator(storage, "127.0.0.1",9199);
// console.log(db)
export { app, db,storage };
