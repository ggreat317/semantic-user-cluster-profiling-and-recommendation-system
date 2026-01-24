import express from "express";
import { db } from "../db.js";
import { ObjectId } from "mongodb";

const router = express.Router();

router.get("/UMAP/self", async (req, res) => {
  // grabs UMAPed message meta data of the requester with text
  const result = await db.collection("messages").aggregate([
    { ownerID: req.user.uid, processedForCluster: true },
      {
        $project: {
          _id: 1,
          label: 1,
          umap3: 1,
          text: 1
        }
      }
  ]).limit(512).toArray();

  // sends the UMAPed meta data
  res.json(result);
})

router.get("/UMAP/others/:userID", async (req, res) =>{
  const { userID } = req.params;
  // checks if selected user is real
  const userDoc = await db.collection("users").findOne({uid: userID});
  if(!userDoc){
    return res.status(404).json({error: "User Not Found!"});
  }

  // grabs UMAPed message meta data of that user without text, for user privacy
  const result = await db.collection("messages").aggregate([
    { ownerID: userID, processedForCluster: true },
      {
        $project: {
          _id: 1,
          label: 1,
          umap3: 1,
        }
      },
  ]).limit(512).toArray()

  // sends the UMAPed meta data
  res.json(result);
})


// the process below will is inefficient and is better handled by the RTDB with security rules to prevent
// unbatchable api calls
// 
// router.get("/room/:userIDs", async (req, res) => {
//   const userID = req.user.uid;
//   const { userIDs } = req.params;

//   // checks if a room was given
//   if (!roomID) {
//     return res.status(400).json({ error: "No Room Given!" })
//   }

//   // attempts to find the room
//   let room
//   if (ObjectId.isValid(room)) {
//     room = await db.collection("rooms").findOne({ _id: new ObjectId(roomID) });
//   } else {
//     room = await db.collection("rooms").findOne({ _id: roomID });
//   }

//   // checks if room is real
//   if (!room) {
//     return res.status(404).json({ error: "Room Not Found!" });
//   }

//   roomUsers = room.users;

//   // checks if user has access to that room
//   if (!roomUsers.some(u => u.uid === userID)) {
//     return res.status(400).json({ error: "User Lacks Room Access!" });
//   }

//   // sends back the users in that room
//   res.json(roomUsers)
// })

// the process the code is attempting below is not efficient, should be handled via firebase auth
/*
router.get("/room/:roomID", async (req, res) => {
  const userID = req.user.uid;
  const { roomID } = req.params;

  // checks if a room was given
  if (!roomID) {
    return res.status(400).json({ error: "No Room Given!" })
  }

  // attempts to find the room
  let room
  if (ObjectId.isValid(room)) {
    room = await db.collection("rooms").findOne({ _id: new ObjectId(roomID) });
  } else {
    room = await db.collection("rooms").findOne({ _id: roomID });
  }

  // checks if room is real
  if (!room) {
    return res.status(404).json({ error: "Room Not Found!" });
  }

  roomUsers = room.users;

  // checks if user has access to that room
  if (!roomUsers.some(u => u.uid === userID)) {
    return res.status(400).json({ error: "User Lacks Room Access!" });
  }

  // sends back the users in that room
  res.json(roomUsers)
})
*/

export default router;
