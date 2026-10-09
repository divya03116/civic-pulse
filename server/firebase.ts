import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { initializeFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Web app config from the Firebase console. These values identify the project and are
// not secrets; access to the data is controlled by Firestore security rules.
// Each one can be overridden from .env to point the server at a different project.
export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyDXRpyPonsMaNnuRVBlfxRhOSmaB8ZVzQs',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'civicpluse-b2017.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'civicpluse-b2017',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'civicpluse-b2017.firebasestorage.app',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '670796369119',
  appId: process.env.FIREBASE_APP_ID || '1:670796369119:web:96526b06c018261310ed6a',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'G-RYBYP7JMK6'
};

export const firebaseApp = initializeApp(firebaseConfig);

// Complaints carry optional fields (assignedTo, feedback, ...) that are often undefined.
export const db = initializeFirestore(firebaseApp, { ignoreUndefinedProperties: true });

// FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 runs against a local emulator instead of the live project.
export const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
if (emulatorHost) {
  const [host, port] = emulatorHost.split(':');
  connectFirestoreEmulator(db, host, Number(port) || 8080);
}
