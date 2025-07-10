// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCg-w1716n7VNeIpCUnIcbvGQjtRdOVQHM",
  authDomain: "password-manager-5e8cc.firebaseapp.com",
  projectId: "password-manager-5e8cc",
  storageBucket: "password-manager-5e8cc.firebasestorage.app",
  messagingSenderId: "384825225750",
  appId: "1:384825225750:web:56de13ccbf3355657b3b37",
  measurementId: "G-JQ5LFG9RZE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, analytics };
export default app;