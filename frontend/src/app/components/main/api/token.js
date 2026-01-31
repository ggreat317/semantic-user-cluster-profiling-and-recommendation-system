
import { getAuth } from "firebase/auth";

const auth = getAuth();
// local host, usually for dev mode
export const API_URL = "http://localhost:5000"
// export const API_URL = process.env.NEXT_PUBLIC_API_URL;

// for testing test if you change API_URL
// console.log(API_URL)
// const res = await fetch(`${API_URL}/`, {
//     method: "GET",
//   });
// console.log("resjson")
// console.log(res.json())

export async function getIdToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");
  return await user.getIdToken();
}