"use client"
import { useEffect, useState } from "react";
import { auth, db } from "./config/firebase";
import { getDocs, collection } from "firebase/firestore"; 

import { Auth } from "./components/auth";
import { CreateUser } from "./createuser/page";

export default function Home() {
  const [signedIn, setSignedIn] = useState(null)

  return(
    <div>
      {!signedIn && <Auth signedIn={setSignedIn} ></Auth>}
      {signedIn && <CreateUser></CreateUser>}
    </div>
  );
}
