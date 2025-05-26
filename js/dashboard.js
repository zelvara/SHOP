import { auth, db } from "./firebase.js";
import { doc, getDoc } from "firebase/firestore";

// Retrieve stored orders for logged-in users
auth.onAuthStateChanged(async (user) => {
  if (user) {
    const userDocRef = doc(db, "users", user.uid);
    const userSnapshot = await getDoc(userDocRef);

    if (userSnapshot.exists()) {
      console.log("User Orders:", userSnapshot.data().orders);

      // Example: Display orders in an HTML element
      const ordersList = document.getElementById("orders-list");
      ordersList.innerHTML = "";

      userSnapshot.data().orders.forEach((order) => {
        const listItem = document.createElement("li");
        listItem.textContent = `Product: ${order.product}, Price: $${order.price}, Date: ${order.date}`;
        ordersList.appendChild(listItem);
      });
    } else {
      console.log("No previous orders found.");
    }
  }
});
