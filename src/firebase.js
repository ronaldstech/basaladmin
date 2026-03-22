import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBXI6GzI_Ecb05EJR56OaYR1EPxAW2nXOs",
  authDomain: "basal-123.firebaseapp.com",
  projectId: "basal-123",
  storageBucket: "basal-123.firebasestorage.app",
  messagingSenderId: "308662542494",
  appId: "1:308662542494:web:eae626a67994a81f2b5b8f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
