import express from "express";
import { db } from "../db.js";
import { ObjectId } from "mongodb";
import * as message from "./messageFunctions.js";

const router = express.Router();

router.post("/", async (req, res) => {

  
  // necessary information from request

  const userID = req.user.uid;
  const room = req.body.room;
  const now = new Date();
  const messageID = new ObjectId();

  // checking validity of request

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

    const userDoc = await db.collection("users").findOneAndUpdate(
      { uid: req.user.uid },
      { $inc: { 
        messagesSinceLastLabelBatch: 1,
        messagesSinceLastEmbedBatch: 1
       } },
      { upsert: true, returnDocument: "after" }
    );

    // necessary information for batching ML api
    const EMEDDING_MULTIPLIER = 2;
    const LABEL_BATCH_MAX_SIZE = 512;
    const MESSAGE_BATCH_SIZE = 32;
    const messagesSinceLastLabelBatch = userDoc.messagesSinceLastLabelBatch;
    const messagesSinceLastEmbedBatch = userDoc.messagesSinceLastEmbedBatch;
    const EMBEDDED_BATCH_SIZE = userDoc.embeddedBatchLimit;
    const takenLabels = userDoc.takenLabels ?? [];


    // these are the four horseman of the backend
    // uploads message to mongo historic
    await message.MongoDBUploadMessage(req, messageID, now)

    // uploads message to firebase real time
    await message.FirebaseUploadMessage(req, messageID, now)
    
    // not an OG horseman (only used for UI abstraction like the UMAP)
    // THIS WILL OVERWRITE AND UPDATE ALL PREVIOUS TAGS (GENRES, FLAGS)
    // await message.updateTags()

    // makes embeddings
    await message.embeddingBatch(req, MESSAGE_BATCH_SIZE, EMBEDDED_BATCH_SIZE, now, messagesSinceLastEmbedBatch)
    
    // makes and updates clusters
    await message.maintenance(req, takenLabels, messagesSinceLastLabelBatch, EMBEDDED_BATCH_SIZE, now, EMEDDING_MULTIPLIER, LABEL_BATCH_MAX_SIZE )

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

// not implementing just yet, needs some more "supervision"
// 
//
// router.put("/:id", async (req, res) => {
//   const { id } = req.params;
//   const result = await db.collection("messages").updateOne(
//     { _id: new ObjectId(id) },
//     { $set: req.body }
//   );
//   console.log("Updated!");
//   res.json(result);
// });

// 
// router.delete("/:id", async (req, res) => {
//   const { id } = req.params;
//   const result = await db.collection("messages").deleteOne({ _id: new ObjectId(id) });
//   console.log("Deleted!");
//   res.json(result);
// });

export default router;