import { auth, db } from "./firebase.js";
import { doc, setDoc, arrayUnion } from "firebase/firestore";

// Function to store orders in Firestore under the user's account
function storeOrder(orderDetails) {
  auth.onAuthStateChanged((user) => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);

      setDoc(userDocRef, {
        email: user.email,
        orders: arrayUnion(orderDetails),
        lastLogin: new Date()
      }, { merge: true }); // Merge to avoid overwriting previous data
    }
  });
}

// Example: Call storeOrder when user places an order
document.getElementById("place-order-btn").addEventListener("click", () => {
  const orderDetails = {
    product: "Example Item",
    price: 19.99,
    date: new Date()
  };
  storeOrder(orderDetails);
});
