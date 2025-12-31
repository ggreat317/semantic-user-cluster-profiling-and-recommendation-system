import "dotenv/config";
import cors from "cors";
import express from "express";

import { connectDB, db } from "./db.js";
import { authenticate } from "./middleware/auth.js";

import messagesRouter from "./routes/messages.js";
import userRouter from "./routes/user.js";
import friendsRouter from "./routes/friends.js";
import accountRouter from "./routes/account.js";
import profileRouter from "./routes/profiles.js";
const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://murmurs.web.app",
    "https://murmurs.web.app/main",
    "https://murmurs.firebaseapp.com"
  ],
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(express.json());

await connectDB();

app.use("/messages", authenticate, messagesRouter);
app.use("/user", authenticate, userRouter);
app.use("/friends", authenticate, friendsRouter);
app.use("/account", accountRouter);
app.use("/profiles", authenticate, profileRouter)

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
