// Make sure firebase is already initialized via your firebase.js file

// Create a dummy product document in the "products" collection
firebase.firestore().collection("products").add({
  name: "Sample Product",
  description: "This is a sample product for initialization.",
  price: 0,
  category: "sample",
  imageURLs: [],
  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  stock: 0
}).then(docRef => {
  console.log("Initialized products collection with document ID: ", docRef.id);
});

// Create a dummy order document in the "orders" collection
firebase.firestore().collection("orders").add({
  userId: "dummy",
  orderedItems: [
    {
      productId: "dummy",
      name: "Dummy Order",
      quantity: 0,
      size: "N/A",
      price: 0,
      imageURL: ""
    }
  ],
  subtotal: 0,
  discount: 0,
  total: 0,
  shippingAddress: {
    name: "",
    address: "",
    city: "",
    pincode: ""
  },
  orderStatus: "Pending",
  orderDate: firebase.firestore.FieldValue.serverTimestamp()
}).then(docRef => {
  console.log("Initialized orders collection with document ID: ", docRef.id);
});

// Create a dummy user document in the "users" collection
firebase.firestore().collection("users").add({
  name: "Dummy User",
  email: "dummy@example.com",
  phoneNumber: "",
  address: {
    street: "",
    city: "",
    pincode: ""
  }
}).then(docRef => {
  console.log("Initialized users collection with document ID: ", docRef.id);
});

// Create a dummy cart document in a standalone "carts" collection
firebase.firestore().collection("carts").add({
  sessionId: "dummySession",
  items: []
}).then(docRef => {
  console.log("Initialized carts collection with document ID: ", docRef.id);
});
