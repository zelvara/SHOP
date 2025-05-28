"use strict";

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function () {
  // Listen for authentication state changes.
  firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
      alert("You must be signed in to view your cart.");
      window.location.href = "auth.html?redirect=cart.html";
      return;
    }
    console.log("Authenticated user:", user.uid);
    // Load the cart items for the authenticated user.
    loadCartItems(user);
  });

  // Redirect to checkout when the button is clicked.
  document.getElementById("checkoutBtn").addEventListener("click", function () {
    window.location.href = "checkout.html";
  });
});

/**
 * Loads the cart items for the specified user and populates the table.
 *
 * @param {Object} user - The current authenticated user.
 */
function loadCartItems(user) {
  const cartItemsContainer = document.getElementById("cartItems");
  cartItemsContainer.innerHTML = ""; // Clear previous items
  let totalCartValue = 0;

  firebase.firestore().collection("carts")
    .where("uid", "==", user.uid)
    .get()
    .then(function(querySnapshot) {
      console.log("Cart query snapshot:", querySnapshot);
      if (querySnapshot.empty) {
        console.log("No documents found for uid", user.uid);
        cartItemsContainer.innerHTML =
          '<tr><td colspan="5">Your cart is empty.</td></tr>';
        document.getElementById("cartTotal").innerText = "Total: ₹0.00";
        return;
      }
      
      querySnapshot.forEach(function(doc) {
        const data = doc.data();
        console.log("Document data:", data);
        const quantity = data.quantity || 1;
        const price = parseFloat(data.price) || 0;
        const itemTotal = quantity * price;
        totalCartValue += itemTotal;

        // Create a table row for this cart item.
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>
            <img src="${data.imageUrl ? data.imageUrl : 'default-product.png'}" alt="${data.productName}">
            <span>${data.productName || "Unnamed Product"}</span>
          </td>
          <td>₹${price.toFixed(2)}</td>
          <td>
            <button onclick="updateQuantity('${doc.id}', ${quantity - 1})" ${quantity <= 1 ? 'disabled' : ''}>−</button>
            <span id="quantity-${doc.id}">${quantity}</span>
            <button onclick="updateQuantity('${doc.id}', ${quantity + 1})">+</button>
          </td>
          <td>₹${itemTotal.toFixed(2)}</td>
          <td>
            <button onclick="removeCartItem('${doc.id}')">Remove</button>
          </td>
        `;
        cartItemsContainer.appendChild(row);
      });
      document.getElementById("cartTotal").innerText = `Total: ₹${totalCartValue.toFixed(2)}`;
    })
    .catch(function(error) {
      console.error("Error loading cart items:", error);
      cartItemsContainer.innerHTML =
        '<tr><td colspan="5">Error loading cart items. Please try again later.</td></tr>';
    });
}

/**
 * Updates the quantity of a specific cart item.
 *
 * @param {string} docId - The Firestore document ID for the cart item.
 * @param {number} newQuantity - The new quantity value.
 */
function updateQuantity(docId, newQuantity) {
  if (newQuantity < 1) return; // Don't allow quantity below 1

  firebase.firestore().collection("carts").doc(docId)
    .update({ quantity: newQuantity })
    .then(function () {
      console.log("Updated quantity for doc:", docId, "to", newQuantity);
      // Reload cart items after update.
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) loadCartItems(user);
      });
    })
    .catch(function (error) {
      console.error("Error updating cart item quantity:", error);
      alert("Failed to update quantity. Please try again.");
    });
}

/**
 * Removes a cart item from Firestore.
 *
 * @param {string} docId - The Firestore document ID for the cart item.
 */
function removeCartItem(docId) {
  if (confirm("Are you sure you want to remove this item from your cart?")) {
    firebase.firestore().collection("carts").doc(docId)
      .delete()
      .then(function () {
        console.log("Removed cart item:", docId);
        // Reload cart items after removal.
        firebase.auth().onAuthStateChanged(function(user) {
          if (user) loadCartItems(user);
        });
      })
      .catch(function (error) {
        console.error("Error removing cart item:", error);
        alert("Failed to remove item. Please try again.");
      });
  }
}
