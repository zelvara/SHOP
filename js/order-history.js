"use strict";

document.addEventListener("DOMContentLoaded", function() {
  // Check authentication state
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
      // If no user is logged in, redirect to the auth page with a redirect back to order-history.html
      window.location.href = "auth.html?redirect=order-history.html";
      return;
    }

    // Query the "orders" collection for documents where "uid" equals the current user's UID,
    // ordered by timestamp in descending order.
    firebase.firestore().collection("orders")
      .where("uid", "==", user.uid)
      .orderBy("timestamp", "desc")
      .get()
      .then((querySnapshot) => {
        const tbody = document.getElementById("orderHistoryBody");
        if (querySnapshot.empty) {
          tbody.innerHTML = "<tr><td colspan='8'>No orders found.</td></tr>";
        } else {
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            let timestamp = "";
            // Format the Firestore timestamp if available
            if (data.timestamp && data.timestamp.toDate) {
              timestamp = data.timestamp.toDate().toLocaleString();
            }
            const row = `
              <tr>
                <td>${doc.id}</td>
                <td>${data.productName || "N/A"}</td>
                <td>${data.size || "N/A"}</td>
                <td>${data.quantity || 1}</td>
                <td>₹${data.totalPrice || 0}</td>
                <td>${data.status || "N/A"}</td>
                <td>${data.utr || "N/A"}</td>
                <td>${timestamp}</td>
              </tr>
            `;
            tbody.innerHTML += row;
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
        document.getElementById("orderHistoryBody").innerHTML = "<tr><td colspan='8'>Error fetching orders.</td></tr>";
      });
  });
});
