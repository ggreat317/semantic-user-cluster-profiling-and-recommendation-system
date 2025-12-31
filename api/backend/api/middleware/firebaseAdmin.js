import admin from "firebase-admin";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function deleteAllUsers() {
  try {
    let result = await admin.auth().listUsers(1000); // List first 1000 users
    while (result.users.length > 0) {
      const uids = result.users.map(user => user.uid);
      await admin.auth().deleteUsers(uids);
      console.log(`Deleted ${uids.length} users`);

      // Check if there are more users
      if (result.pageToken) {
        result = await admin.auth().listUsers(1000, result.pageToken);
      } else {
        break;
      }
    }
    console.log("All users deleted");
  } catch (err) {
    console.error("Error deleting users:", err);
  }
}

//deleteAllUsers();

export default admin;


