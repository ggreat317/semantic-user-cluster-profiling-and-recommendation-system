import express from "express";
import { db } from "../db.js";
import { ObjectId } from "mongodb";
import admin from "../middleware/firebaseAdmin.js"

const router = express.Router();

router.post("/", async (req, res) => {
  
  // necessary information from request

  const now = new Date();
  const userID = req.user.uid;
  const messageID = new ObjectId();
  const room = req.body.room;

  // necessary information for batching ML api

  const MESSAGE_BATCH_SIZE = 32;
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

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

    // attempting to post data to proper channels

    // posting the message in mongo database first for accurate storage

    console.log("Attempting to post message to MongoDB")
    await db.collection("messages").insertOne({
      _id: messageID,
      ...req.body,
      time: now,
      ownerID: userID,
      processedForEmbed: false,
      processedForCluster: false
    });

    
    await db.collection("rooms").updateOne(
      { _id: room },
      { $set: { lastAccessed: now } }
    );

    console.log("Successfully posted to MongoDB");

    // posting message in the firebase room for realtime fan out frontend

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

    // batching the users messages for embedding and umapping

    console.log("Attempting to batch messages")

    const messageBatch = await db.collection("messages").find({
      ownerID: userID,
      processedForEmbed: { $ne: true }
    }).limit(MESSAGE_BATCH_SIZE).toArray();

    if(messageBatch.length < MESSAGE_BATCH_SIZE){
      console.log("Not Enough Messages to Batch!")
      return res.status(201).json({ id: messageID.toString() });
    }

    const texts = messageBatch.map(msg => msg.text)

    console.log("Successfully batched messages")

    console.log("Attempting to post embeddings to MongoDB")

    const embedResponse = await fetch("http://ml:8000/embed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: texts }),
    });
    const embedData = await embedResponse.json()

    const messageBatchUpdate = messageBatch.map((msg, i) => ({
      updateOne: {
        filter: { messageID: msg._id },
        update: {
          $set: {
            processedForEmbed: true,
            "embedding" : embedData.embeddings[i],
            "umap3": embedData.umap3[i],
            "umap5": embedData.umap5[i]
          }
        }
      }
    }));

    await db.collection("messages").bulkWrite(messageBatchUpdate);

    console.log("Successfully posted embeddings to MongoDB");

    // under current model, for this to successfully be called, the embedding batch size,
    // must be a multiple of the messaging batch size, to go around just make both async
    // i would do it now, but.... will do it by next commit lol
    // currently the messaging batch size is 32 and the embedding batch size scales from
    // 32 to a limit 512 by multiplying by 2, the embedding limit rate. 
    // 32 - 64 - 128 - 256 - 512

    console.log("Attempting to batch embeddings");

    const user = await db.collection("users").findOne({uid: userID});
    const EMBEDDED_BATCH_SIZE = user.embeddedBatchLimit;

    if (!EMBEDDED_BATCH_SIZE){
      return res.status(400).json({ error: "User Lacks Embedded Batch Limit!" })
    }

    const embeddedBatch = await db.collection("messages").find({
      ownerID: userID,
      processedForCluster: { $ne: true }
    }).limit(EMBEDDED_BATCH_SIZE).toArray();

    if(embeddedBatch.length < EMBEDDED_BATCH_SIZE){
      console.log("Not Enough Messages to Batch!")
      return res.status(201).json({ id: messageID.toString() });
    }

    
    const embeds = embeddedBatch.map(msg => msg.umap5)

    console.log("Successfully batched messages")

    console.log("Attempting to post labels to MongoDB")

    const labeledResponse = await fetch("http://ml:8000/labels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: embeds }),
    });
    const labeledData = await labeledResponse.json()

    const LabeledBatchUpdate = embeddedBatch.map((msg, i) => ({
      updateOne: {
        filter: { messageID: msg._id },
        update: {
          $set: {
            processedForCluster: true,
            "label" : labeledData.embeddings[i]
          }
        }
      }
    }));

    await db.collection("messages").bulkWrite(LabeledBatchUpdate);
    if ( EMBEDDED_BATCH_SIZE * 2 < 513 ){
      await db.collection("users").updateOne(
        {uid: userID},
        {$set: {embeddedBatchLimit : EMBEDDED_BATCH_SIZE * 2}}
      );
    }

    console.log("Successfully posted labels to MongoDB");

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