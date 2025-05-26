import { auth } from "./firebase.js";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const provider = new GoogleAuthProvider();

// Function to log in with Google
function loginWithGoogle() {
  signInWithPopup(auth, provider)
    .then((result) => {
      console.log("User signed in:", result.user.email);
    })
    .catch((error) => {
      console.error("Error during sign-in:", error);
    });
}

// Function to log out
function logout() {
  signOut(auth)
    .then(() => {
      console.log("User signed out.");
    })
    .catch((error) => {
      console.error("Error during logout:", error);
    });
}

// Attach event listeners to buttons in your HTML
document.getElementById("login-btn").addEventListener("click", loginWithGoogle);
document.getElementById("logout-btn").addEventListener("click", logout);
