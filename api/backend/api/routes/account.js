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
    return res.status(400).json({ error: "Email, password, and displayName are required" });
  }

  try {
    // Check if user already exists in Firebase
    try {
      const existingUser = await admin.auth().getUserByEmail(email);
      return res.status(400).json({ error: "Email already in use" });
    } catch (err) {
      // Not found is OK
    }

    // Create Firebase Auth user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName
    });

    // Optionally: set custom claims or roles
    // await admin.auth().setCustomUserClaims(userRecord.uid, { role: "user" });

    // Insert user into Mongo
    const creationTime = new Date();

    const result = await db.collection("users").insertOne({
      uid: userRecord.uid,
      email,
      displayName,
      createdAt: creationTime,
      lastLoginAt: creationTime,
    });

    await db.collection("rooms").updateOne(
      { _id: new ObjectId("general") },
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

    await admin.firestore()
      .collection("roomVault")
      .doc("general")
      .set(
        { users: admin.firestore.FieldValue.arrayUnion(userRecord.uid) },
        { merge: true }
      );
    // Generate a custom Firebase token for frontend sign-in
    const firebaseToken = await admin.auth().createCustomToken(userRecord.uid);

    return res.status(201).json({
      message: "User created successfully",
      uid: userRecord.uid,
      firebaseToken
    });
  } catch (err) {
    console.error("Failed to create user:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
