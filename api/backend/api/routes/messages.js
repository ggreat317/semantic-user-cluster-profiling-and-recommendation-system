import express from "express";
import { db } from "../db.js";
import { ObjectId } from "mongodb";
import admin from "../middleware/firebaseAdmin.js"

const router = express.Router();

router.post("/", async (req, res) => {
  const userID = req.user.uid;
  const messageID = new ObjectId();
  const room = req.body.room;

  if (!room) {
    return res.status(400).json({ error: "No Room Given!" })
  }

  let roomAccess
  if (ObjectId.isValid(room)) {
    roomAccess = await db.collection("rooms").findOne({ _id: new ObjectId(room) });
  } else {
    roomAccess = await db.collection("rooms").findOne({ _id: room });
  }

  if (!roomAccess) {
    return res.status(404).json({ error: "Room Not Found!" })
  }

  if (!roomAccess.users.some(u => u.uid === userID)) {
    return res.status(400).json({ error: "User Lacks Chat Access!" });
  }

  try {
    const now = new Date();
    console.log("Attempting to post message to MongoDB")
    await db.collection("messages").insertOne({
      _id: messageID,
      ...req.body,
      time: now,
      ownerID: userID
    });

    
    await db.collection("rooms").updateOne(
      { _id: room },
      { $set: { lastAccessed: now } }
    );

    console.log("Successfully posted to MongoDB");

    console.log("Attempting to post to Firebase");
    await admin.firestore().collection("rooms").doc(req.body.room).collection("messages").doc(`${messageID}`).set({
      ...req.body,
      time: admin.firestore.FieldValue.serverTimestamp(),
      ownerID: userID
    });

    await admin.firestore().collection("roomVault").doc(room).set({
      lastAccessed: now
    }, { merge: true })
    console.log("Successfully posted to Firebase");

    console.log("Attempting to post embedding to MongoDB")
    const response = await fetch("http://ml:8000/embed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: req.body.text }),
    });
    const data = await response.json()
    await db.collection("users").updateOne(
      {uid: req.user.uid},
      {$addToSet: {embed: data}},
      {upsert: true}
    )
    console.log("Successfully posted embedding to MongoDB");

    res.status(201).json({ id: messageID.toString() });
  } catch (err) {
    console.log(`ERROR posting: ${userID} at ${messageID}`);
    console.log(err);
    res.status(500).json({ error: "Message Send Failure!" });
  }
});

router.get("/", async (req, res) => {
  const { room, before, limit = 50 } = req.query;

  if (!room) {
    return res.status(400).json({ error: "No Room Specified!" })
  }

  let roomAccess
  if (ObjectId.isValid(room)) {
    roomAccess = await db.collection("rooms").findOne({ _id: new ObjectId(room) });
  } else {
    roomAccess = await db.collection("rooms").findOne({ _id: room });
  }

  if (!roomAccess) {
    return res.status(404).json({ error: "Room Does Not Exist!" })
  }

  if (!roomAccess.users.some(u => u.uid === (req.user.uid))) {
    return res.status(400).json({ error: "User Has No Access!" })
  }

  const maxLimit = 100;
  const safeLimit = Math.min(Number(limit), maxLimit);

  if (before && isNaN(Date.parse(before))) {
    return res.status(400).json({ error: "Invalid 'before' date" })
  }

  const query = { room }
  if (before) {
    query.time = { $lt: new Date(before) }
  }

  const messages = await db.collection("messages").find(query).sort({ time: -1 }).limit(Number(safeLimit)).toArray();
  console.log("Read!");
  res.json(messages.reverse().map(m => ({
    id: m._id.toString(),
    ...m
  })));
});

// Update
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const result = await db.collection("messages").updateOne(
    { _id: new ObjectId(id) },
    { $set: req.body }
  );
  console.log("Updated!");
  res.json(result);
});

// Delete
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const result = await db.collection("messages").deleteOne({ _id: new ObjectId(id) });
  console.log("Deleted!");
  res.json(result);
});

export default router;