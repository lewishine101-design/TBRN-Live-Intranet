import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQJiugjtDKf2HnQbx2sy29EdI4jGXVDeI",
  authDomain: "tbrn-live-intranet.firebaseapp.com",
  projectId: "tbrn-live-intranet",
  storageBucket: "tbrn-live-intranet.firebasestorage.app",
  messagingSenderId: "106825657812",
  appId: "1:106825657812:web:795df14b84c1e1c0f77a41",
  measurementId: "G-NXX6T4FZDS"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let firebaseReadyResolve;

export const firebaseReady = new Promise((resolve) => {
  firebaseReadyResolve = resolve;
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.info("TBRN Live connected to Firebase.");
    firebaseReadyResolve({ user, db });
    return;
  }

  try {
    await signInAnonymously(auth);
  } catch (error) {
    console.error("Anonymous Firebase sign-in failed:", error);
  }
});

export async function loadSharedDocument(documentName) {
  await firebaseReady;

  const reference = doc(db, "intranetData", documentName);
  const snapshot = await getDoc(reference);

  return snapshot.exists() ? snapshot.data() : null;
}

export async function saveSharedDocument(documentName, data) {
  await firebaseReady;

  const reference = doc(db, "intranetData", documentName);

  await setDoc(
    reference,
    {
      ...data,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

export async function watchSharedDocument(
  documentName,
  onChange,
  onError = console.error
) {
  await firebaseReady;

  const reference = doc(db, "intranetData", documentName);

  return onSnapshot(
    reference,
    (snapshot) => {
      onChange(snapshot.exists() ? snapshot.data() : null);
    },
    onError
  );
}
