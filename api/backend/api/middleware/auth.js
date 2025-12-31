import admin from "./firebaseAdmin.js"; // initialized Firebase Admin
import { db } from "../db.js"; // grabbing db

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1]; // Bearer <token>
  console.log("Attempting Authorization!")
  try {
    const dToken = await admin.auth().verifyIdToken(token);
    console.log("Valid Token")
    const result = await db.collection("users").findOneAndUpdate(
      { uid: dToken.uid },
      {
        $setOnInsert: {
          uid: dToken.uid,
          email: dToken.email ?? null,
          createdAt: new Date(),
          displayName: dToken.name ?? "Unknown"
        },
        $set: {
          lastLoginAt: new Date(),
        }
      },
      { upsert: true, returnDocument: "after" }
    );
    req.user = result;
    console.log("logged user active")
    next();
  } catch (err) {
    console.log("Invalid Token")
    res.status(401).json({ error: "Invalid or expired token" });
  }
};