"use strict";

function fetchOrderHistory() {
  const tbody = document.getElementById("orderHistoryBody");
  // Fetch orders from Firestore; ideally filter by the logged-in customer's identifier
  db.collection("orders")
    .orderBy("timestamp", "desc")
    .get()
    .then((snapshot) => {
      tbody.innerHTML = ""; // Clear any existing content
      snapshot.forEach((doc) => {
        const order = doc.data();
        const timestamp = order.timestamp ? new Date(order.timestamp.toDate()).toLocaleString() : "N/A";
        const row = `
          <tr>
            <td>${doc.id}</td>
            <td>${order.productName || "N/A"}</td>
            <td>${order.size || "N/A"}</td>
            <td>${order.quantity || 1}</td>
            <td>₹${order.totalPrice || 0}</td>
            <td>${order.status || "N/A"}</td>
            <td>${order.utr || "N/A"}</td>
            <td>${timestamp}</td>
          </tr>
        `;
        tbody.innerHTML += row;
      });
      if (snapshot.empty) {
        tbody.innerHTML = "<tr><td colspan='8'>No orders found.</td></tr>";
      }
    })
    .catch((error) => {
      console.error("Error fetching order history: ", error);
      tbody.innerHTML = "<tr><td colspan='8'>Error loading orders. Please try again later.</td></tr>";
    });
}

document.addEventListener("DOMContentLoaded", fetchOrderHistory);
