import express from "express";
import { db } from "../db.js";
import { ObjectId } from "mongodb";

const router = express.Router();

router.get("/UMAP/self", async (req,res) => {
  const userID = req.user.uid;
  const userDoc = await db.collection("users").findOne({_id: userID});
  const embeddedArray = userDoc[embed];
  console.log(embeddedArray);
  const result = embeddedArray
  res.json(result);
})

router.get("/UMAP/others/:userID", async (req,res) =>{
  const { userID } = req.params;

  const userDoc = await db.collection("users").findOne({uid: userID});

  if(!userDoc){
    return res.status(404).json({error: "User Not Found!"});
  }

  const embeddedArray = userDoc.embed;

  console.log("Attempting to fetch umap")
  const response = await fetch("http://ml:8000/UMAP", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ array: embeddedArray }),
    });
  const result = await response.json();
  console.log("Fetch umap successful")

  console.log("Attempting to fetch labels")
  const response1 = await fetch("http://ml:8000/labels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ array: embeddedArray }),
    });
  const result1 = await response1.json();
  console.log("Fetch labels successful")

  console.log(result1)

  res.json(result);
})

export default router;
