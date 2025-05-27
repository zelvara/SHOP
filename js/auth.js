// auth.js
// Uses the global firebase.auth() and firebase.auth.GoogleAuthProvider from the CDN.

function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      console.log("User signed in:", result.user.email);
      // Reveal the main content upon successful login.
      document.getElementById("main-content").style.display = "block";
    })
    .catch((error) => {
      console.error("Error during sign-in:", error);
    });
}

function logoutUser() {
  firebase.auth().signOut()
    .then(() => {
      console.log("User signed out.");
      document.getElementById("main-content").style.display = "none";
      // Optionally redirect to a login page if you have one.
      window.location.href = "auth.html";
    })
    .catch((error) => {
      console.error("Error during logout:", error);
    });
}

// Monitor authentication state changes.
// If the user is logged in, show the main content;
// otherwise, redirect them to the authentication page.
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log("User authenticated:", user);
    document.getElementById("main-content").style.display = "block";
  } else {
    console.log("User not signed in.");
    document.getElementById("main-content").style.display = "none";
    window.location.href = "auth.html"; // Adjust this path if needed.
  }
});

// Attach the logout function to the logout button.
document.getElementById("logout-btn").addEventListener("click", logoutUser);

// If you need a login button, you can call loginWithGoogle() from its click event.
// For example, if you add a login button on your auth.html page:
// document.getElementById("login-btn").addEventListener("click", loginWithGoogle);
