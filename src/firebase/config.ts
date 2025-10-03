import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBlSwEB2f8t2P5gVBYYxfVIeVQcrp565ns",
  authDomain: "machines-79a46.firebaseapp.com",
  databaseURL: "https://machines-79a46-default-rtdb.firebaseio.com",
  projectId: "machines-79a46",
  storageBucket: "machines-79a46.firebasestorage.app",
  messagingSenderId: "39558698415",
  appId: "1:39558698415:web:1f82931c67dde62a3e0b5a",
  measurementId: "G-YKPBRJG4VJ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;