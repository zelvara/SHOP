"use strict";

document.addEventListener("DOMContentLoaded", function () {
  // Monitor authentication state
  firebase.auth().onAuthStateChanged(function (user) {
    if (!user) {
      alert("Please sign in to view and manage your cart.");
      window.location.href = "auth.html?redirect=cart.html";
      return;
    }
    console.log("Cart loaded for user:", user.uid);
    loadCartItems(user);
  });

  // Checkout button event listener
  document.getElementById("checkoutBtn").addEventListener("click", function () {
    window.location.href = "checkout.html";
  });

  // Sample Add To Cart button for demonstration.
  document
    .getElementById("addSampleProductBtn")
    .addEventListener("click", function () {
      let sampleProduct = {
        id: "prod_001",
        name: "Example Product",
        price: 499.99,
        imageUrl: "https://via.placeholder.com/50" // Sample image URL
      };
      addToCart(sampleProduct);
    });
});

/**
 * Adds a product to the cart.
 */
function addToCart(product) {
  firebase.auth().onAuthStateChanged(function (user) {
    if (!user) {
      alert("Please sign in to add items to your cart.");
      window.location.href = "auth.html?redirect=cart.html";
      return;
    }
    console.log("Adding to cart for user:", user.uid);

    const cartRef = firebase.firestore().collection("carts");

    // Check if the product is already in the user's cart
    cartRef
      .where("uid", "==", user.uid)
      .where("productId", "==", product.id)
      .get()
      .then(function (querySnapshot) {
        if (querySnapshot.empty) {
          // Not in cart – add new document
          cartRef
            .add({
              uid: user.uid,
              productId: product.id,
              productName: product.name,
              price: product.price,
              quantity: 1,
              imageUrl: product.imageUrl || "default-product.png"
            })
            .then(function (docRef) {
              console.log("Product added with doc ID:", docRef.id);
              alert("Product added to cart!");
              loadCartItems(user);
            })
            .catch(function (error) {
              console.error("Error adding product to cart:", error);
              alert("Failed to add product to cart. Please try again.");
            });
        } else {
          // If product exists, update its quantity
          querySnapshot.forEach(function (doc) {
            let currentQty = doc.data().quantity || 1;
            doc.ref
              .update({
                quantity: currentQty + 1
              })
              .then(function () {
                console.log("Cart updated for product:", product.id);
                alert("Cart updated!");
                loadCartItems(user);
              })
              .catch(function (error) {
                console.error("Error updating cart item:", error);
                alert("Failed to update cart. Please try again.");
              });
          });
        }
      })
      .catch(function (error) {
        console.error("Error checking cart:", error);
        alert("Failed to add item. Please try again.");
      });
  });
}

/**
 * Load the cart items for the current user.
 */
function loadCartItems(user) {
  const cartItemsContainer = document.getElementById("cartItems");
  cartItemsContainer.innerHTML = ""; // Clear previous items
  let totalCartValue = 0;

  firebase
    .firestore()
    .collection("carts")
    .where("uid", "==", user.uid)
    .get()
    .then(function (querySnapshot) {
      console.log("Documents found:", querySnapshot.docs);
      if (querySnapshot.empty) {
        cartItemsContainer.innerHTML =
          '<tr><td colspan="5">Your cart is empty.</td></tr>';
        document.getElementById("cartTotal").innerText = "Total: ₹0.00";
        return;
      }
      
      querySnapshot.forEach(function (doc) {
        const data = doc.data();
        const quantity = data.quantity || 1;
        const price = parseFloat(data.price) || 0;
        const itemTotal = quantity * price;
        totalCartValue += itemTotal;

        cartItemsContainer.innerHTML += `
          <tr id="cart-item-${doc.id}">
            <td>
              <img src="${data.imageUrl ? data.imageUrl : "default-product.png"}" alt="${data.productName}" />
              <span>${data.productName || "Unnamed Product"}</span>
            </td>
            <td>₹${price.toFixed(2)}</td>
            <td>
              <button onclick="updateQuantity('${doc.id}', ${quantity - 1})" ${quantity <= 1 ? "disabled" : ""}>–</button>
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
    .catch(function (error) {
      console.error("Error loading cart items:", error);
      cartItemsContainer.innerHTML =
        '<tr><td colspan="5">Error loading cart items. Please try again later.</td></tr>';
    });
}

/**
 * Updates the quantity of an item in Firestore.
 */
function updateQuantity(docId, newQuantity) {
  if (newQuantity < 1) return; // Prevent quantity from going below 1

  firebase
    .firestore()
    .collection("carts")
    .doc(docId)
    .update({ quantity: newQuantity })
    .then(function () {
      firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          loadCartItems(user);
        }
      });
    })
    .catch(function (error) {
      console.error("Error updating cart item quantity:", error);
      alert("Failed to update quantity. Please try again.");
    });
}

/**
 * Removes an item from the cart.
 */
function removeCartItem(docId) {
  if (confirm("Are you sure you want to remove this item from your cart?")) {
    firebase
      .firestore()
      .collection("carts")
      .doc(docId)
      .delete()
      .then(function () {
        firebase.auth().onAuthStateChanged(function (user) {
          if (user) {
            loadCartItems(user);
          }
        });
      })
      .catch(function (error) {
        console.error("Error removing cart item:", error);
        alert("Failed to remove item. Please try again.");
      });
  }
}
