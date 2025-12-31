import { MongoClient, ServerApiVersion } from "mongodb";
import 'dotenv/config';  // loads MONGO_URI

const uri = process.env.MONGO_URI;
export const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

export let db;

export async function connectDB() {
  if (db) return db;
  await client.connect();   // connect to Atlas
  db = client.db("myDatabase");

  // Indexes
  await db.collection("users").createIndex(
    {uid: 1},
    {unique: true}
  )
  console.log("Mongo is locked and loaded!")
  return db
}

