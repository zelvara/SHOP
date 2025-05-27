"use strict";

// Listen for the signup form submission
document.getElementById("signupForm").addEventListener("submit", function(e) {
  e.preventDefault();

  // Retrieve field values
  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // Simple password confirmation check
  if (password !== confirmPassword) {
    alert("Passwords do not match. Please try again.");
    return;
  }

  // Create a new user with Firebase Authentication
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signup successful! Optionally update the profile with the full name.
      const user = userCredential.user;
      return user.updateProfile({
        displayName: fullName
      });
    })
    .then(() => {
      // Retrieve optional redirect target from the URL
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get("redirect") || "index.html";
      window.location.href = redirectTo;
    })
    .catch((error) => {
      console.error("Signup error:", error);
      alert("Signup failed: " + error.message);
    });
});
