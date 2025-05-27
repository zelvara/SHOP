"use strict";

// Retrieve dynamic product details from localStorage
const productPrice = parseFloat(localStorage.getItem("productPrice")) || 0;
const productQuantity = parseInt(localStorage.getItem("productQuantity")) || 1;
const total = productPrice * productQuantity;
document.getElementById("totalAmount").innerText = total;

// Construct the UPI payment URL using your UPI id and dynamic total
const upiData = "upi://pay?pa=v1ng@ybl&pn=Zelvara&am=" + total + "&cu=INR";
const qrURL = "https://api.qrserver.com/v1/create-qr-code/?data=" + encodeURIComponent(upiData) + "&size=200x200";
document.getElementById("qrCode").src = qrURL;

// Add click event listener for "Confirm Payment"
document.getElementById("confirmPaymentBtn").addEventListener("click", function () {
  const utr = document.getElementById("utrInput").value.trim();
  const utrRegex = /^\d{12}$/; // expecting a valid 12-digit UTR
  if (!utrRegex.test(utr)) {
    alert("Please enter a valid 12-digit UTR.");
    return;
  }
  
  // Retrieve the orderId stored in localStorage from checkout.js
  const orderId = localStorage.getItem("orderId");
  if (!orderId) {
    alert("No order found. Please try again.");
    return;
  }
  
  // Update the order document with the UTR and change the status to "Paid"
  db.collection("orders").doc(orderId).update({
    utr: utr,
    status: "Paid"
  })
  .then(() => {
    // Optionally clear the orderId later if needed—but for now, keep it so processing.html can use it.
    window.location.href = "processing.html?orderId=" + orderId;
  })
  .catch(error => {
    console.error("Error updating order: ", error);
    alert("Error confirming payment. Please try again.");
  });
});

