"use strict";

// Listen for form submit
document.getElementById("signInForm").addEventListener("submit", function (e) {
  e.preventDefault();

  // Get the email and password values from the form
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  // Sign in using Firebase Authentication
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Sign-in successful.
      // Retrieve the intended redirect destination from the URL, if provided.
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get("redirect") || "index.html";
      window.location.href = redirectTo;
    })
    .catch((error) => {
      console.error("Sign-in error:", error);
      alert("Sign-in failed: " + error.message);
    });
});

