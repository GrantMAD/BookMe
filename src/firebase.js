// src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB8xcTErDCepmYMBbJVIH-AW0qrfQNaUNE",
    authDomain: "bookme-39ce3.firebaseapp.com",
    projectId: "bookme-39ce3",
    storageBucket: "bookme-39ce3.firebasestorage.app",
    messagingSenderId: "64196399404",
    appId: "1:64196399404:web:a3bffd07a86a463c4c9c89"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
