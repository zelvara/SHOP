"use strict";

document.addEventListener("DOMContentLoaded", function() {
  const productsContainer = document.getElementById("productsContainer");
  
  firebase.firestore().collection("products").get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const product = doc.data();
        const docId = doc.id;
        const imageUrl = (product.imageURLs && product.imageURLs.length > 0) ? product.imageURLs[0] : "";
        
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
        // On click, navigate to the product details page
        colDiv.addEventListener("click", function() {
          window.location.href = "product.html?id=" + docId;
        });
        productsContainer.appendChild(colDiv);
      });
    })
    .catch((error) => {
      console.error("Error fetching products: ", error);
      productsContainer.innerHTML = "<p>Error loading products. Please try again later.</p>";
    });
});
