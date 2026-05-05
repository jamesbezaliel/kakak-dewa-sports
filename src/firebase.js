// firebase.js

// Import the functions you need from the SDKs you need
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBV-9nRXEixWEJSzWW5XcgfUgIovKhxogI",
  authDomain: "kakak-dewa-sports.firebaseapp.com",
  projectId: "kakak-dewa-sports",
  storageBucket: "kakak-dewa-sports.firebasestorage.app",
  messagingSenderId: "303492060389",
  appId: "1:303492060389:web:50b93aa1531a46404cb00c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

