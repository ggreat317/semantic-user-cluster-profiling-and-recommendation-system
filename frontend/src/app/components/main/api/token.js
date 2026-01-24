import { getAuth } from "firebase/auth";

const auth = getAuth();

// CHANGE THIS TO THE ENV FILE API URL BEFORE DEPLOYING

export const API_URL = "http://localhost:5000"

export async function getIdToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");
  return await user.getIdToken();
}