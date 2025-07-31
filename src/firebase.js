import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAymrAQqHZBm4wspvy31cWEFRLGpU27tWg",
  authDomain: "e-ttendance-52a1d.firebaseapp.com",
  projectId: "e-ttendance-52a1d",
  storageBucket: "e-ttendance-52a1d.firebasestorage.app",
  messagingSenderId: "580778857059",
  appId: "1:580778857059:web:2ee5132c1d7ac4a661de56",
  measurementId: "G-GYRCLF8H1Q"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };