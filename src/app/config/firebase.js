// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB8Q2sPBl7UBKu25JQpZmXZidFNM-MxHt8",
  authDomain: "murmur-82b61.firebaseapp.com",
  databaseURL: "https://murmur-82b61-default-rtdb.firebaseio.com",
  projectId: "murmur-82b61",
  storageBucket: "murmur-82b61.firebasestorage.app",
  messagingSenderId: "495411204700",
  appId: "1:495411204700:web:0bbffba0a14107e3044c99",
  measurementId: "G-7KHEJ1KTDD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);