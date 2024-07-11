import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB8s_yA3WEWQZGFwT6MOKCK_-EnTD4FwJ8",
  authDomain: "tinder-clone-8326d.firebaseapp.com",
  projectId: "tinder-clone-8326d",
  storageBucket: "tinder-clone-8326d.appspot.com",
  messagingSenderId: "635804944915",
  appId: "1:635804944915:web:1aaa4fbe34bae66c174de6",
  measurementId: "G-LJF0VQ453M"
};

const app = initializeApp(firebaseConfig);

const database= getFirestore(app);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export {database, auth, provider};