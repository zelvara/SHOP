"use strict";

document.addEventListener("DOMContentLoaded", function() {
  const productsContainer = document.getElementById("productsContainer");
  
  // Fetch products from Firestore
  firebase.firestore().collection("products").get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const product = doc.data();
        const docId = doc.id;
        const imageUrl = (product.imageURLs && product.imageURLs.length > 0) ? product.imageURLs[0] : "default-product.png";
        
        // Create a product card element
        const colDiv = document.createElement("div");
        colDiv.className = "col-md-4 mb-4";
        colDiv.innerHTML = `
          <div class="card product-card" data-id="${docId}">
            <div class="img-container">
              <img src="${imageUrl}" alt="${product.name}">
            </div>
            <div class="card-body">
              <h5 class="card-title">${product.name}</h5>
              <p class="card-text">₹${product.price}</p>
            </div>
          </div>
        `;
        
        // When a product card is clicked, add that product to the cart and redirect to cart.html.
        colDiv.addEventListener("click", function() {
          addToCart(product, docId);
        });
        productsContainer.appendChild(colDiv);
      });
    })
    .catch((error) => {
      console.error("Error fetching products: ", error);
      productsContainer.innerHTML = "<p>Error loading products. Please try again later.</p>";
    });
});

/**
 * Adds a product to the cart for the current user.
 * If the product already exists, increments its quantity.
 * Otherwise, creates a new cart document.
 * After a successful add/update, the user is redirected to cart.html.
 *
 * @param {Object} product - The product object from Firestore.
 * @param {string} docId - The Firestore document ID for the product.
 */
function addToCart(product, docId) {
  firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
      alert("Please sign in to add items to your cart.");
      // Redirect to auth page with a redirect to products page
      window.location.href = "auth.html?redirect=products.html";
      return;
    }
    
    const cartRef = firebase.firestore().collection("carts");
    
    // Check if this product is already in the user's cart.
    cartRef.where("uid", "==", user.uid)
      .where("productId", "==", docId)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          // Not in cart: add new document.
          cartRef.add({
            uid: user.uid,
            productId: docId,
            productName: product.name,
            price: product.price,
            quantity: 1,
            imageUrl: (product.imageURLs && product.imageURLs.length > 0) ? product.imageURLs[0] : "default-product.png"
          })
          .then(() => {
            alert("Product added to cart.");
            window.location.href = "cart.html";
          })
          .catch((error) => {
            console.error("Error adding product to cart:", error);
            alert("Failed to add product to cart. Please try again.");
          });
        } else {
          // If the product exists, update its quantity.
          querySnapshot.forEach((doc) => {
            const currentQty = doc.data().quantity || 1;
            doc.ref.update({
              quantity: currentQty + 1
            })
            .then(() => {
              alert("Cart updated.");
              window.location.href = "cart.html";
            })
            .catch((error) => {
              console.error("Error updating cart item:", error);
              alert("Failed to update cart. Please try again.");
            });
          });
        }
      })
      .catch((error) => {
        console.error("Error checking cart:", error);
        alert("Error adding item. Please try again.");
      });
  });
}
