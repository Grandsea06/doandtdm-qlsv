import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut
}
from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
}
from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCuYC5vdYhK-thd0MWlc56-hdxz-eKZuXM",
  authDomain: "doandtdm-20eb1.firebaseapp.com",
  projectId: "doandtdm-20eb1",
  storageBucket: "doandtdm-20eb1.firebasestorage.app",
  messagingSenderId: "225278947264",
  appId: "1:225278947264:web:10de7e726baf519babe225",
  measurementId: "G-ZS8R0TXHT7"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

export {
  db,
  auth,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  signInWithEmailAndPassword,
  signOut
};