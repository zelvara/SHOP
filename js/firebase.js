// firebase.js
// Replace the placeholder values with your actual Firebase configuration details.
const firebaseConfig = {
  apiKey: "AIzaSyBGMqdsoSVs7JwM-zpPFDbErPKoJONH6rk",
  authDomain: "zelvara.firebaseapp.com",
  projectId: "zelvara",
  storageBucket: "zelvara.firebasestorage.app",
  messagingSenderId: "818365516027",
  appId: "1:818365516027:web:9d05f2c2d61279595e485e"
};

// Initialize Firebase using the global “firebase” object provided by the CDN.
firebase.initializeApp(firebaseConfig);

// Create instances of Auth and Firestore, then expose them globally for use in other scripts.
const auth = firebase.auth();
const db = firebase.firestore();

window.auth = auth;
window.db = db;
