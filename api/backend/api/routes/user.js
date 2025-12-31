import express from "express";
import { db } from "../db.js";

const router = express.Router();

// should probably put try catch everywhere

router.get("/", async (req, res) => {
  const { field } = req.query;
  if (!field || typeof field !== "string") {
    return res.status(400).json({ error: "No Field Specified!" })
  }

  const userDoc = await db.collection("users").findOne({ uid: req.user.uid });
  
  if (!userDoc) {
    return res.status(404).json({ error: "Do you even exist? User not found!" });
  }
  console.log("Got Your Profile!");

  const data = userDoc[field];
  if (data === undefined) {
    return res.status(404).json({ error: `Field '${field}' not found!` })
  }

  res.json({ [field]: data });
});

router.get("/rooms", async (req, res) => {
  try {
    const userID = req.user.uid;

    const rooms = await db.collection("rooms").aggregate([
      { $match: { "users.uid": userID } },
      {
        $project: {
          _id: 1,
          name: 1,
          lastAccessed: 1,
          type: 1,
          users: 1
        }
      },
      { $sort: { lastAccessed: -1 } }
    ]).toArray();

    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

router.put("/profile", async (req, res) => {
  const result = await db.collection("users").findOneAndUpdate(
    { uid: req.user.uid },
    { $set: { profile: req.body } },
    { returnDocument: "after" }
  );
  console.log("Updated User Profile!");
  res.json(result.value);
});

router.put("/custom/:slot", async (req, res) => {
  const { slot } = req.params;
  if (!(["One", "Two", "Three", "Four", "Five", "Six", "Last"].includes(slot))) {
    return res.status(400).json({ error: "No Allowed Slot Specified!" })
  }

  const result = await db.collection("users").updateOne(
    { uid: req.user.uid },
    { $set: { [`custom${slot}`]: req.body } }
  );
  console.log(`Updated User Custom ${slot}!`);
  res.json(result);
});

export default router;
