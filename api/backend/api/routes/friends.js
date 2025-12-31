import express from "express";
import { db } from "../db.js";
import { ObjectId } from "mongodb";
import admin from "../middleware/firebaseAdmin.js"


const router = express.Router();

router.get("/request", async (req, res) => {
  const query = {
    to: req.user.uid,
    status: "pending"
  }
  try {
    const result = await db.collection("friend_requests").find(query).sort({ updatedAt: -1 }).limit(100).toArray();
    if (result.length === 0) {
      return res.json([])
    }

    res.json(result.map(r => ({
      id: r._id.toString(),
      from: r.from,
      fromName: r.fromName,
      time: r.updatedAt
    })));

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Friend request retrieval failed!" });
  }
});

router.put("/request/:recipientID", async (req, res) => {
  const senderID = req.user.uid;
  const { recipientID } = req.params;

  if (senderID === recipientID) {
    return res.status(400).json({ error: "Cannot friend yourself!" });
  }

  try {
    const recipient = await db.collection("users").findOne({ uid: recipientID });
    if (!recipient) {
      return res.status(400).json({ error: "Not found!" });
    }

    if (recipient.friends && recipient.friends.some(f => f.uid === senderID)) {
      return res.status(400).json({ error: "Already friends!" })
    }

    const sender = await db.collection("users").findOne({ uid: senderID });

    const checkRequests = await db.collection("friend_requests").findOne(
      {
        from: recipientID,
        to: senderID,
        status: "pending"
      },
    )

    if (checkRequests) {
      await acceptFriendRequest(senderID, recipientID);
      return res.json({ success: true, acceptedReverse: true });
    }

    const result = await db.collection("friend_requests").findOneAndUpdate(
      {
        from: senderID,
        to: recipientID,
        status: "pending",
        count: { $lt: 3 },
        reject: { $lt: 3 }
      },
      {
        $setOnInsert: {
          from: senderID,
          to: recipientID,
          fromName: sender.displayName,
          status: "pending",
          createdAt: new Date(),
          reject: 0
        },
        $inc: { count: 1 },
        $set: {
          updatedAt: new Date(),
        }
      },
      {
        upsert: true,
        returnDocument: "after"
      }
    );

    if (!result.value) {
      return res.status(429).json({
        error: "Request limit reached"
      });
    }

    res.json({ success: true, request: result.value });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Friend request failed!" });
  }
});

router.put("/acceptRequest/:friendID", async (req, res) => {
  const { friendID } = req.params;
  const userID = req.user.uid;

  try {
    await acceptFriendRequest(userID, friendID);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Accepting friend request failed!" });
  }
});

async function acceptFriendRequest(userID, friendID) {
  const newRoom = new ObjectId();

  const request = await db.collection("friend_requests").findOneAndDelete({
    from: friendID,
    to: userID,
    status: "pending"
  });

  if (!request) {
    throw new Error("No Friend Request to Accept!");
  }

  const existingFM = await db.collection("rooms").findOne({
    type: "F",
    users: { $all: [userID, friendID] }
  });

  if (existingFM) {
    return;
  }

  const roomCreationTime = new Date()

  await db.collection("rooms").insertOne({
    _id: newRoom,
    name: newRoom.toString(),
    type: "F",
    users: [{ uid: userID }, { uid: friendID }],
    lastAccessed: roomCreationTime
  });

  await admin.firestore().collection("roomVault").doc(newRoom.toString()).set({
    type: "F",
    users: [userID, friendID],
    name: newRoom.toString(),
    lastAccessed: roomCreationTime
  });

  await db.collection("users").updateOne(
    { uid: userID },
    { $addToSet: { friends: { uid: friendID, room: newRoom } } }
  );

  await db.collection("users").updateOne(
    { uid: friendID },
    { $addToSet: { friends: { uid: userID, room: newRoom } } }
  );
}


export default router;
