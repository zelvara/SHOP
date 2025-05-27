"use strict";

/*
  cart.js - Contains all functionality for managing the shopping cart.
*/

/**
 * Creates or retrieves a cart document in Firestore based on the given ID.
 *
 * @param {string} id - The user UID or guest cart ID.
 * @returns {Promise<DocumentReference>} A Promise resolving to the cart document reference.
 */
function getOrCreateCart(id) {
  const cartDocRef = firebase.firestore().collection("carts").doc(id);
  return cartDocRef
    .get()
    .then((doc) => {
      if (!doc.exists) {
        // If cart does not exist, create one with an empty items array.
        return cartDocRef.set({
          userId: firebase.auth().currentUser ? id : null,
          items: [],
        }).then(() => cartDocRef);
      }
      return cartDocRef;
    })
    .catch((error) => {
      console.error("Error in getOrCreateCart:", error);
    });
}

/**
 * Fetches cart items from Firestore and triggers UI rendering.
 */
function fetchCartItems() {
  let cartId = null;
  if (firebase.auth().currentUser) {
    cartId = firebase.auth().currentUser.uid;
  } else {
    cartId = localStorage.getItem("guestCartId");
  }
  if (!cartId) {
    // No cart exists; show an empty cart message.
    document.getElementById("cartContent").innerHTML =
      "<p>Your cart is empty.</p>";
    document.getElementById("cartSummary").innerHTML = "";
    return;
  }
  firebase
    .firestore()
    .collection("carts")
    .doc(cartId)
    .get()
    .then((doc) => {
      if (doc.exists) {
        const cartData = doc.data();
        const cartItems = cartData.items || [];
        renderCart(cartItems);
        renderSummary(cartItems);
      } else {
        document.getElementById("cartContent").innerHTML =
          "<p>Your cart is empty.</p>";
      }
    })
    .catch((error) => console.error("Error fetching cart items: ", error));
}

/**
 * Renders the cart table with the provided cart items.
 *
 * @param {Array} cartItems - An array of cart item objects.
 */
function renderCart(cartItems) {
  const cartContent = document.getElementById("cartContent");
  if (cartItems.length === 0) {
    cartContent.innerHTML = "<p>Your cart is empty.</p>";
    document.getElementById("cartSummary").innerHTML = "";
    return;
  }
  let tableHTML = `
    <table class="table table-bordered cart-table">
      <thead class="table-light">
        <tr>
          <th>Product</th>
          <th>Description</th>
          <th>Price (₹)</th>
          <th>Quantity</th>
          <th>Subtotal (₹)</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
  `;
  cartItems.forEach((item, index) => {
    const subtotal = item.price * item.quantity;
    tableHTML += `
      <tr data-index="${index}">
        <td><img src="${item.imageURL}" alt="${item.name}"></td>
        <td>
          <strong>${item.name}</strong><br>
          Size: ${item.size}
        </td>
        <td>${item.price}</td>
        <td>
          <input type="number" class="form-control qty-input" value="${item.quantity}" min="1" style="width:80px;">
        </td>
        <td class="subtotal">${subtotal}</td>
        <td>
          <button class="btn btn-danger btn-sm remove-item" data-index="${index}">Remove</button>
        </td>
      </tr>
    `;
  });
  tableHTML += `</tbody></table>`;
  cartContent.innerHTML = tableHTML;

  // Attach event listeners for quantity updates.
  document.querySelectorAll(".qty-input").forEach((input) => {
    input.addEventListener("change", function () {
      const row = this.closest("tr");
      const index = row.getAttribute("data-index");
      let newQty = parseInt(this.value, 10);
      if (newQty < 1) newQty = 1;
      updateCartItem(index, { quantity: newQty });
    });
  });

  // Attach event listeners for removal actions.
  document.querySelectorAll(".remove-item").forEach((button) => {
    button.addEventListener("click", function () {
      const index = this.getAttribute("data-index");
      removeCartItem(index);
    });
  });
}

/**
 * Updates a cart item at the given index with new data.
 *
 * @param {number} index - The index of the cart item.
 * @param {Object} newData - An object containing updated data (e.g., quantity).
 */
function updateCartItem(index, newData) {
  const cartId = firebase.auth().currentUser
    ? firebase.auth().currentUser.uid
    : localStorage.getItem("guestCartId");
  firebase
    .firestore()
    .collection("carts")
    .doc(cartId)
    .get()
    .then((doc) => {
      const items = doc.data().items || [];
      items[index] = { ...items[index], ...newData };
      return firebase
        .firestore()
        .collection("carts")
        .doc(cartId)
        .update({ items });
    })
    .then(fetchCartItems)
    .catch((error) => console.error("Error updating cart item:", error));
}

/**
 * Removes a cart item from the cart.
 *
 * @param {number} index - The index of the cart item to remove.
 */
function removeCartItem(index) {
  const cartId = firebase.auth().currentUser
    ? firebase.auth().currentUser.uid
    : localStorage.getItem("guestCartId");
  firebase
    .firestore()
    .collection("carts")
    .doc(cartId)
    .get()
    .then((doc) => {
      const items = doc.data().items || [];
      items.splice(index, 1);
      return firebase
        .firestore()
        .collection("carts")
        .doc(cartId)
        .update({ items });
    })
    .then(() => {
      alert("Item removed successfully.");
      fetchCartItems();
    })
    .catch((error) => console.error("Error removing cart item:", error));
}

/**
 * Renders the cart summary section including totals and the gift card option.
 *
 * @param {Array} cartItems - An array of cart item objects.
 */
function renderSummary(cartItems) {
  const cartSummary = document.getElementById("cartSummary");
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const discount = window.appliedDiscount || 0;
  const total = subtotal - discount;
  const summaryHTML = `
    <div class="cart-summary">
      <h4>Cart Totals</h4>
      <p>Subtotal: ₹${subtotal}</p>
      <p id="discountInfo">Discount: ₹${discount}</p>
      <hr>
      <h5>Total: ₹${total}</h5>
      <div class="mb-3">
        <label for="giftcard" class="form-label">Gift Card / Promo Code</label>
        <div class="d-flex">
          <input type="text" id="giftcard" class="form-control giftcard-input" placeholder="Enter code">
          <button id="applyGiftcard" class="btn btn-info ms-2">Apply</button>
        </div>
        <div id="giftMessage" class="mt-2"></div>
      </div>
      <div class="d-flex">
        <button id="continueShopping" class="btn btn-secondary me-2">Continue Shopping</button>
        <button id="checkoutBtn" class="btn btn-success">Proceed to Checkout</button>
      </div>
    </div>
  `;
  cartSummary.innerHTML = summaryHTML;

  document.getElementById("applyGiftcard").addEventListener("click", applyGiftCard);
  document.getElementById("continueShopping").addEventListener("click", () => {
    window.location.href = "index.html";
  });
  document.getElementById("checkoutBtn").addEventListener("click", () => {
    window.location.href = "checkout.html";
  });
}

/**
 * Applies a gift card or promo code to the cart.
 */
function applyGiftCard() {
  const code = document.getElementById("giftcard").value.trim();
  const giftMsgDiv = document.getElementById("giftMessage");
  const cartId = firebase.auth().currentUser
    ? firebase.auth().currentUser.uid
    : localStorage.getItem("guestCartId");
  firebase
    .firestore()
    .collection("carts")
    .doc(cartId)
    .get()
    .then((doc) => {
      const items = doc.data().items || [];
      const subtotal = items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      if (code === "GIFT10") {
        window.appliedDiscount = Math.floor(subtotal * 0.1);
        giftMsgDiv.innerHTML =
          '<span class="text-success">Gift card applied. 10% discount!</span>';
      } else {
        window.appliedDiscount = 0;
        giftMsgDiv.innerHTML =
          '<span class="text-danger">Invalid gift card code.</span>';
      }
      fetchCartItems();
    })
    .catch((error) =>
      console.error("Error applying gift card:", error)
    );
}

// Initialize the cart on authentication state change.
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // Logged-in user: Use UID for the cart document.
    getOrCreateCart(user.uid).then(() => {
      fetchCartItems();
    });
  } else {
    // Guest user: Use (or create) a guest cart.
    let guestCartId = localStorage.getItem("guestCartId");
    if (!guestCartId) {
      guestCartId = "guest_" + Date.now();
      localStorage.setItem("guestCartId", guestCartId);
      firebase
        .firestore()
        .collection("carts")
        .doc(guestCartId)
        .set({ userId: null, items: [] })
        .then(() => {
          fetchCartItems();
        });
    } else {
      fetchCartItems();
    }
  }
});
