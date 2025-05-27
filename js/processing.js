"use strict";

function fetchOrderDetails() {
  const orderId = localStorage.getItem("orderId");
  if (!orderId) {
    document.getElementById("orderDetails").innerHTML = "<p>No order found.</p>";
    return;
  }
  
  db.collection("orders").doc(orderId).get()
    .then(doc => {
      if (doc.exists) {
        const data = doc.data();
        // Populate the table with the basic order details.
        const tbody = document.getElementById("orderTableBody");
        tbody.innerHTML = `
          <tr>
            <td>${doc.id}</td>
            <td>${data.productName || "N/A"}</td>
            <td>${data.size || "N/A"}</td>
            <td>${data.quantity || 1}</td>
            <td>₹${data.totalPrice || 0}</td>
          </tr>
        `;
        // Update the status field.
        document.getElementById("statusValue").innerText = data.status || "Processing";
        
        // Create or update a shipping details section to show customer details.
        let shippingSection = document.getElementById("shippingDetails");
        if (!shippingSection) {
          shippingSection = document.createElement("div");
          shippingSection.id = "shippingDetails";
          shippingSection.style.marginTop = "20px";
          document.getElementById("orderDetails").appendChild(shippingSection);
        }
        shippingSection.innerHTML = `
          <h4>Shipping Details:</h4>
          <p><strong>Customer Name:</strong> ${data.customerName || "N/A"}</p>
          <p><strong>Address:</strong> ${data.address || "N/A"}</p>
          <p><strong>City:</strong> ${data.city || "N/A"}</p>
          <p><strong>State:</strong> ${data.state || "N/A"}</p>
          <p><strong>Zip Code:</strong> ${data.zipcode || "N/A"}</p>
        `;
      } else {
        document.getElementById("orderDetails").innerHTML = "<p>Order not found.</p>";
      }
    })
    .catch(error => {
      console.error("Error fetching order: ", error);
      document.getElementById("orderDetails").innerHTML = "<p>Error fetching order details.</p>";
    });
}

document.addEventListener("DOMContentLoaded", fetchOrderDetails);
