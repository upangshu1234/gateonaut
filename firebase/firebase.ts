
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCdeqkU9wPXhAQ4Uyn4tGR3iBjlvqISC84",
  authDomain: "gateonaut-prod.firebaseapp.com",
  projectId: "gateonaut-prod",
  storageBucket: "gateonaut-prod.appspot.com",
  messagingSenderId: "114774095404",
  appId: "1:114774095404:web:42ad849224a9418c284389"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);

let firestoreDb;

try {
  // Attempt to enable offline persistence (can fail in private windows)
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch (err) {
  console.warn("Firestore Persistence Failed (likely private mode). Falling back to memory-only.", err);
  // Fallback to default memory-only firestore
  firestoreDb = getFirestore(app);
}

export const db = firestoreDb;
