// Initialize Cloudinary's Upload Widget using your Cloudinary account details
// Make sure you have created an unsigned upload preset named "unsigned_preset" in your Cloudinary dashboard.
var myWidget = cloudinary.createUploadWidget(
  {
    cloudName: "dbasdsgte", // your Cloudinary cloud name
    uploadPreset: "unsigned_preset", // the unsigned preset you created in Cloudinary
    multiple: true // allow multiple image uploads
  },
  (error, result) => {
    if (!error && result && result.event === "success") {
      console.log("Image uploaded: ", result.info.secure_url);
      
      // Append the uploaded image URL to the hidden input (comma separated)
      let imageField = document.getElementById("imageURLs");
      let currentImages = imageField.value;
      currentImages = currentImages ? currentImages + "," + result.info.secure_url : result.info.secure_url;
      imageField.value = currentImages;
      
      // Update the upload status display
      document.getElementById("upload_status").innerText = "Image(s) uploaded successfully.";
    } else if (error) {
      console.error("Upload Error:", error);
    }
  }
);

// Trigger the Cloudinary upload widget when the button is clicked
document.getElementById("upload_widget").addEventListener("click", function () {
  myWidget.open();
});

// Form submission event
document.getElementById("productForm").addEventListener("submit", function (e) {
  e.preventDefault();

  // Retrieve form values
  var name = document.getElementById("productName").value;
  var price = parseFloat(document.getElementById("productPrice").value);
  var description = document.getElementById("productDescription").value;
  var category = document.getElementById("productCategory").value;
  var imageURLsStr = document.getElementById("imageURLs").value;

  // Validate that at least one image has been uploaded
  if (!imageURLsStr) {
    alert("Please upload at least one image before adding the product.");
    return;
  }

  // Convert the comma-separated string to an array
  var imageURLs = imageURLsStr.split(",");

  // Add the product to Firestore (assuming Firestore is already initialized in js/firebase.js)
  firebase
    .firestore()
    .collection("products")
    .add({
      name: name,
      price: price,
      description: description,
      category: category,
      imageURLs: imageURLs,
    })
    .then(function (docRef) {
      console.log("Product added with ID: ", docRef.id);
      document.getElementById("message").innerText =
        "Product added successfully (ID: " + docRef.id + ")";
      // Reset form and clear the hidden imageURLs field and status message
      document.getElementById("productForm").reset();
      document.getElementById("imageURLs").value = "";
      document.getElementById("upload_status").innerText = "";
    })
    .catch(function (error) {
      console.error("Error adding product: ", error);
      document.getElementById("message").innerText =
        "Error adding product: " + error.message;
    });
});
