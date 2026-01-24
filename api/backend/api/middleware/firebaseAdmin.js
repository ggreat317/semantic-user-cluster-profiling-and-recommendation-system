import admin from "firebase-admin";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://murmur-82b61-default-rtdb.firebaseio.com/"
});

async function deleteAllUsers() {
  try {
    let result = await admin.auth().listUsers(1000); // lists first 1000 users
    while (result.users.length > 0) {
      const uids = result.users.map(user => user.uid);
      await admin.auth().deleteUsers(uids);
      console.log(`Deleted ${uids.length} users`);

      // checks if there are more users
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

// uncomment below code to reset users, (it takes a while to manually do, but everything else is current manual delete)
// because it is easy and to prevent mistakes
// DONT FORGET COMMENT OUT AFTER USE
// deleteAllUsers();

export default admin;


