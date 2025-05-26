// deleteTestData.js

// Load environment variables from 'sensitivedata.env'
require('dotenv').config({ path: 'sensitivedata.env' });

const admin = require("firebase-admin");

// Parse the Firebase service account key from the environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

// Initialize Firebase Admin with your service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "zelvara"
});

const db = admin.firestore();

// Delete test data: Query for documents in the "orders" collection where the "test" field is true.
db.collection("orders")
  .where("test", "==", true)
  .get()
  .then((snapshot) => {
    if (snapshot.empty) {
      console.log("No test documents found.");
      return;
    }
    const batch = db.batch();
    snapshot.forEach((doc) => {
      console.log("Deleting document:", doc.id);
      batch.delete(doc.ref);
    });
    return batch.commit();
  })
  .then(() => {
    console.log("Test documents deleted successfully.");
  })
  .catch((err) => {
    console.error("Error deleting test data:", err);
  });
