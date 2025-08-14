// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ⬇⬇ 이 부분에 콘솔에서 보여준 config를 그대로 붙여넣어
export const firebaseConfig = {
  apiKey: "AIzaSyA6p4h89vtAlho4eztwStPaYN0ORc6i0Q",
  authDomain: "npmlsite.firebaseapp.com",
  projectId: "npmlsite",
  storageBucket: "npmlsite.appspot.com",
  messagingSenderId: "186697073652",
  appId: "1:186697073652:web:95a7d17c736a0d95ffafa1"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export { signInWithPopup, signOut, onAuthStateChanged };
