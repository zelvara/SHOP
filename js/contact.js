"use strict";

document.getElementById("contactForm").addEventListener("submit", function(e) {
  e.preventDefault();
  
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const message = document.getElementById("message").value.trim();
  
  if (!name || !email || !subject || !message) {
    document.getElementById("contactFeedback").innerText = "Please fill in all fields.";
    return;
  }
  
  // Save the contact message to Firestore in the "contacts" collection
  db.collection("contacts").add({
    name: name,
    email: email,
    subject: subject,
    message: message,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    document.getElementById("contactFeedback").innerHTML = "<p class='text-success'>Your message has been sent. Thank you!</p>";
    document.getElementById("contactForm").reset();
  })
  .catch((error) => {
    console.error("Error sending message:", error);
    document.getElementById("contactFeedback").innerHTML = "<p class='text-danger'>There was an error sending your message. Please try again later.</p>";
  });
});
