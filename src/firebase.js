// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCE-lxjq7oFIXL7Uw3qJ2K_Ty_IMhAI0Qk",
  authDomain: "owngorithm.firebaseapp.com",
  projectId: "owngorithm",
  storageBucket: "owngorithm.firebasestorage.app",
  messagingSenderId: "368091865573",
  appId: "1:368091865573:web:d4723c74fa0f125f234f0c",
  measurementId: "G-GC3NYE4Y5B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, analytics, db, auth, googleProvider };
