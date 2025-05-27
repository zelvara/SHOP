"use strict";

document.getElementById("payNowBtn").addEventListener("click", function () {
  // Retrieve shipping details from the form
  const fullName = document.getElementById("fullName").value.trim();
  const address = document.getElementById("address").value.trim();
  const city = document.getElementById("city").value.trim();
  const state = document.getElementById("state").value.trim();
  const zipcode = document.getElementById("zipcode").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const phone2 = document.getElementById("phone2").value.trim(); // optional

  if (!fullName || !address || !city || !state || !zipcode || !phone) {
    alert("Please fill in all required shipping details (including phone number).");
    return;
  }
  
  // Retrieve product details from localStorage
  const productName = localStorage.getItem("productName") || "Default Product Name";
  const productSize = localStorage.getItem("productSize") || "M";
  const productPrice = parseFloat(localStorage.getItem("productPrice")) || 0;
  const productQuantity = parseInt(localStorage.getItem("productQuantity")) || 1;
  const totalPrice = productPrice * productQuantity;
  
  // Create an order object with dynamic product & shipping details
  const order = {
    customerName: fullName,
    address: address,
    city: city,
    state: state,
    zipcode: zipcode,
    phone: phone,
    phone2: phone2 || null, // optional
    productName: productName,
    size: productSize,
    quantity: productQuantity,
    totalPrice: totalPrice,
    status: "Pending Payment",
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  // Save the order document to the "orders" collection in Firestore
  db.collection("orders").add(order)
    .then(docRef => {
      localStorage.setItem("orderId", docRef.id);
      window.location.href = "payment.html";
    })
    .catch(error => {
      console.error("Error creating order: ", error);
      alert("Error creating order, please try again.");
    });
});
