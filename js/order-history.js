"use strict";

document.addEventListener("DOMContentLoaded", function() {
  // Check authentication state
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
      console.error("No user logged in! Redirecting to auth page...");
      window.location.href = "auth.html?redirect=order-history.html";
      return;
    }

    console.log("Logged-in user UID:", user.uid); // Debug: logging current UID

    // Query Firestore: Fetch orders for the current user, ordered by timestamp descending
    firebase.firestore().collection("orders")
      .where("uid", "==", user.uid)
      .orderBy("timestamp", "desc")
      .get()
      .then((querySnapshot) => {
        console.log("Number of orders fetched:", querySnapshot.docs.length);
        const tbody = document.getElementById("orderHistoryBody");
        if (querySnapshot.empty) {
          tbody.innerHTML = "<tr><td colspan='8'>No orders found.</td></tr>";
          console.warn("No orders found for the user.");
        } else {
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log("Order Data:", data);
            let timestamp = "";
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
        // In many cases, Firestore will return a detailed error message showing a link to create the missing index.
        document.getElementById("orderHistoryBody").innerHTML = "<tr><td colspan='8'>Error fetching orders.</td></tr>";
      });
  });
});

