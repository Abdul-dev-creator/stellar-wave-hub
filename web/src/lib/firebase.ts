import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let _firestore: Firestore | null = null;

function getFirestoreInstance(): Firestore {
  if (_firestore) return _firestore;

  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        "Firebase credentials not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables."
      );
    }

    const serviceAccount: ServiceAccount = { projectId, clientEmail, privateKey };
    initializeApp({ credential: cert(serviceAccount) });
  }

  _firestore = getFirestore();
  return _firestore;
}

// Proxy that defers initialization until first actual use at request time
const firestore = new Proxy({} as Firestore, {
  get(_target, prop, receiver) {
    const instance = getFirestoreInstance();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export default firestore;
