// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBNvA1E1O3nqvCn-NTeuxDOpuB77lAuzDY",
  authDomain: "ondontoclinica-2026.firebaseapp.com",
  projectId: "ondontoclinica-2026",
  storageBucket: "ondontoclinica-2026.firebasestorage.app",
  messagingSenderId: "1043773847074",
  appId: "1:1043773847074:web:f7a143d260107409b17c7b",
  measurementId: "G-4Y2CYYZ6DC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
