import { initializeApp, getApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountString) {
  throw new Error(
    'FIREBASE_SERVICE_ACCOUNT_KEY is not set. Please add it to your .env file.'
  );
}

const serviceAccount = JSON.parse(serviceAccountString);

const adminApp =
  getApps().find((app) => app.name === 'admin') ||
  initializeApp(
    {
      credential: cert(serviceAccount),
    },
    'admin'
  );

const db = getFirestore(adminApp);

export { adminApp, db };
