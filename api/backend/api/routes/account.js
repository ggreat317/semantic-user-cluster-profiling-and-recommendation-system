// routes/createUser.js
import express from "express";
import admin from "../middleware/firebaseAdmin.js"; // initialized Firebase Admin SDK
import { db } from "../db.js"; // MongoDB connection
import rateLimit from "express-rate-limit";

const router = express.Router();

// Optional: simple rate limiter to prevent abuse
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // max 5 requests per IP per window
  message: "Too many accounts created from this IP, please try later."
});

router.post("/", limiter, async (req, res) => {
  const { email, password, displayName } = req.body;

  if (!email || !password || !displayName) {
    return res.status(400).json({ error: "Email, password, and name are required" });
  }

  // small check to see if acc. already made
  try {
    await admin.auth().getUserByEmail(email);
    return res.status(400).json({ error: "Email already in use" });
  } catch (err) {
    console.log("attempting to make new account");
  }

  // creates firebase user with only basic info here, to prevent frontend access
  const userRecord = await admin.auth().createUser({
    email,
    password,
    displayName
  });

  try {

    //  for mongo insert with all that juicy metadata
    const creationTime = new Date();

    await db.collection("users").insertOne({
      uid: userRecord.uid,
      email,
      displayName,
      createdAt: creationTime,
      lastLoginAt: creationTime,
      embeddedBatchLimit: 1,
      messagesSinceLastLabelBatch: 0,
      messagesSinceLastEmbedBatch: 0,
    });

    await db.collection("rooms").updateOne(
      { _id: "general" },
      {
        $setOnInsert: {
          name: "general",
          type: "G",
          lastAccessed: creationTime
        },
        $addToSet: {
          users: {
            uid: userRecord.uid,
            lastActive: creationTime
          }
        }
      },
      { upsert: true }
    );

    await admin.firestore().collection("roomVault").doc("general").set(
        { users: admin.firestore.FieldValue.arrayUnion(userRecord.uid) },
        { merge: true }
    );

    console.log("attempting to update RTDB")

    await admin.database().ref(`rooms/general`).update({
      [`members/users/${userRecord.uid}/userName`]: displayName,
      [`metadata/lastAccessed`]: creationTime
    });

    console.log("successfully updated RTDB")

    // generates a custom Firebase token for frontend sign-in
    const firebaseToken = await admin.auth().createCustomToken(userRecord.uid);

    return res.status(201).json({
      message: "User created successfully",
      uid: userRecord.uid,
      firebaseToken
    });
  } catch (err) {
    console.error("Failed to create user:", err);
    console.log("failure in account creation");
    console.log("attempting to undo progress in failed account creation");

    await admin.auth().deleteUser(userRecord.uid);

    await db.collection("users").deleteOne({ uid: userRecord.uid });

    await db.collection("rooms").updateOne(
      { _id: "general" },
      { $pull: { users: { uid: userRecord.uid } } }
    );

    await admin.firestore().collection("roomVault").doc("general").update(
        { users: admin.firestore.FieldValue.arrayRemove(userRecord.uid) },
    );

    console.log("successfully undid progress in failed account creation");
    return res.status(500).json({ error: "Internal server error" });

  }
});

export default router;
