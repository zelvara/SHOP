// js/admin.js
"use strict";

// Configure Cloudinary Upload Widget
var myWidget = cloudinary.createUploadWidget(
  {
    cloudName: "your_cloud_name",       // REPLACE with your Cloudinary cloud name
    uploadPreset: "unsigned_preset"       // REPLACE with your unsigned preset name
  },
  (error, result) => {
    if (!error && result && result.event === "success") {
      console.log("Cloudinary Upload Successful:", result.info);
      let imageURLsField = document.getElementById("imageURLs");
      let currentURLs = imageURLsField.value ? JSON.parse(imageURLsField.value) : [];
      currentURLs.push(result.info.secure_url);
      imageURLsField.value = JSON.stringify(currentURLs);
      document.getElementById("upload_status").innerText = "Uploaded: " + result.info.secure_url;
    } else if (error) {
      console.error("Cloudinary Upload Error:", error);
    }
  }
);

document.getElementById("upload_widget").addEventListener("click", function () {
  myWidget.open();
}, false);

// Add product functionality
document.getElementById("productForm").addEventListener("submit", function (e) {
  e.preventDefault();
  
  const productName = document.getElementById("productName").value.trim();
  const productPrice = parseFloat(document.getElementById("productPrice").value);
  const productDescription = document.getElementById("productDescription").value.trim();
  const productCategory = document.getElementById("productCategory").value;
  const imageURLs = document.getElementById("imageURLs").value;
  
  if (!productName || !productPrice || !productDescription || !productCategory || !imageURLs) {
    document.getElementById("message").innerHTML = "<div class='alert alert-danger'>Please fill in all fields and upload images.</div>";
    return;
  }
  
  const product = {
    name: productName,
    price: productPrice,
    description: productDescription,
    category: productCategory,
    imageURLs: JSON.parse(imageURLs)
  };
  
  db.collection("products").add(product)
    .then(() => {
      document.getElementById("message").innerHTML = "<div class='alert alert-success'>Product added successfully.</div>";
      document.getElementById("productForm").reset();
      document.getElementById("imageURLs").value = "";
      document.getElementById("upload_status").innerText = "";
    })
    .catch((error) => {
      console.error("Error adding product:", error);
      document.getElementById("message").innerHTML = "<div class='alert alert-danger'>Error adding product. Please try again.</div>";
    });
});

"use strict";

// Order Management: Fetch and display orders
function fetchOrders() {
  db.collection("orders").orderBy("timestamp", "desc").get()
    .then((snapshot) => {
      const tbody = document.getElementById("ordersTableBody");
      tbody.innerHTML = "";
      snapshot.forEach((doc) => {
        const data = doc.data();
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${doc.id}</td>
          <td>${data.customerName || "N/A"}</td>
          <td>${data.phone || "N/A"}</td>
          <td>${data.phone2 || "N/A"}</td>
          <td>${data.productName || "N/A"}</td>
          <td>${data.size || "N/A"}</td>
          <td>${data.quantity || 1}</td>
          <td>₹${data.totalPrice || 0}</td>
          <td>${data.status || "N/A"}</td>
          <td>${data.utr || "N/A"}</td>
          <td>
            <select class="form-select status-select" style="width:120px; display:inline-block;">
              <option value="Pending Payment" ${data.status==="Pending Payment" ? "selected" : ""}>Pending Payment</option>
              <option value="Paid" ${data.status==="Paid" ? "selected" : ""}>Paid</option>
              <option value="Processing" ${data.status==="Processing" ? "selected" : ""}>Processing</option>
              <option value="Shipped" ${data.status==="Shipped" ? "selected" : ""}>Shipped</option>
              <option value="Delivered" ${data.status==="Delivered" ? "selected" : ""}>Delivered</option>
            </select>
            <button class="btn btn-sm btn-primary update-status-btn" data-id="${doc.id}">Update</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch((error) => {
      console.error("Error fetching orders:", error);
    });
}

document.addEventListener("DOMContentLoaded", fetchOrders);

// Delegate event for updating order status via the dropdown button
document.getElementById("ordersTableBody").addEventListener("click", function (e) {
  if (e.target && e.target.classList.contains("update-status-btn")) {
    const orderId = e.target.getAttribute("data-id");
    const selectElem = e.target.parentElement.querySelector(".status-select");
    const newStatus = selectElem.value;
    db.collection("orders").doc(orderId).update({ status: newStatus })
      .then(() => {
        alert("Order status updated successfully.");
        fetchOrders();
      })
      .catch((error) => {
        console.error("Error updating order status:", error);
        alert("Error updating order status.");
      });
  }
});


