"use strict";

document.addEventListener("DOMContentLoaded", function() {
  // Monitor authentication state
  firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
      alert("Please sign in to view your cart.");
      window.location.href = "auth.html?redirect=cart.html";
      return;
    }
    loadCartItems(user);
  });

  // Checkout button event listener
  document.getElementById("checkoutBtn").addEventListener("click", function() {
    window.location.href = "checkout.html";
  });
});

/**
 * Load the cart items for the current user.
 * Uses Firestore collection "carts", where each document should have:
 * - uid: the user's unique ID
 * - productName: product title/name
 * - price: unit price of the product
 * - quantity: number of items
 * - imageUrl: (optional) image URL for the product
 */
function loadCartItems(user) {
  const cartItemsContainer = document.getElementById("cartItems");
  cartItemsContainer.innerHTML = ""; // Clear previous items
  let totalCartValue = 0;

  firebase.firestore().collection("carts")
    .where("uid", "==", user.uid)
    .get()
    .then(function(querySnapshot) {
      if (querySnapshot.empty) {
        cartItemsContainer.innerHTML = '<tr><td colspan="5">Your cart is empty.</td></tr>';
        document.getElementById("cartTotal").innerText = "Total: ₹0.00";
        return;
      }

      querySnapshot.forEach(function(doc) {
        const data = doc.data();
        const quantity = data.quantity || 1;
        const price = parseFloat(data.price) || 0;
        const itemTotal = quantity * price;
        totalCartValue += itemTotal;

        cartItemsContainer.innerHTML += `
          <tr id="cart-item-${doc.id}">
            <td>
              <img src="${data.imageUrl ? data.imageUrl : 'default-product.png'}" alt="${data.productName}" />
              <span>${data.productName || "Unnamed Product"}</span>
            </td>
            <td>₹${price.toFixed(2)}</td>
            <td>
              <button onclick="updateQuantity('${doc.id}', ${quantity - 1})" ${quantity <= 1 ? 'disabled' : ''}>-</button>
              <span id="quantity-${doc.id}">${quantity}</span>
              <button onclick="updateQuantity('${doc.id}', ${quantity + 1})">+</button>
            </td>
            <td>₹${itemTotal.toFixed(2)}</td>
            <td>
              <button onclick="removeCartItem('${doc.id}')">Remove</button>
            </td>
          </tr>
        `;
      });
      document.getElementById("cartTotal").innerText = `Total: ₹${totalCartValue.toFixed(2)}`;
    })
    .catch(function(error) {
      console.error("Error loading cart items:", error);
      cartItemsContainer.innerHTML = '<tr><td colspan="5">Error loading cart items. Please try again later.</td></tr>';
    });
}

/**
 * Update the quantity of an item in Firestore.
 * @param {string} docId - The Firestore document ID for the cart item.
 * @param {number} newQuantity - The new quantity value.
 */
function updateQuantity(docId, newQuantity) {
  if (newQuantity < 1) return; // Ensure quantity doesn't drop below 1

  firebase.firestore().collection("carts").doc(docId).update({
    quantity: newQuantity
  })
  .then(function() {
    // Reload cart items after the update
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) loadCartItems(user);
    });
  })
  .catch(function(error) {
    console.error("Error updating cart item quantity:", error);
  });
}

/**
 * Remove an item from the cart.
 * @param {string} docId - The Firestore document ID for the cart item.
 */
function removeCartItem(docId) {
  if (confirm("Are you sure you want to remove this item from your cart?")) {
    firebase.firestore().collection("carts").doc(docId).delete()
      .then(function() {
        firebase.auth().onAuthStateChanged(function(user) {
          if (user) loadCartItems(user);
        });
      })
      .catch(function(error) {
        console.error("Error removing cart item:", error);
      });
  }
}
