// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Added Firestore imports

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBp8P9azoJX3M7hwHjI6ze3UtFAQ997nJc",
  authDomain: "shhhdrop.firebaseapp.com",
  projectId: "shhhdrop",
  storageBucket: "shhhdrop.firebasestorage.app",
  messagingSenderId: "361551202473",
  appId: "1:361551202473:web:2b080d353397e6650f01b8",
  measurementId: "G-S1GVJV228M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app); // Initialize Firestore

export { auth, provider, signInWithPopup, db }; // Export db for Firestore usage


