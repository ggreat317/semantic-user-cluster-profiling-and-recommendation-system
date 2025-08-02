import { useState, useRef, useEffect } from "react";
import { Auth } from "../components/auth";
import { db } from "../config/firebase";
import { getDocs, collection } from "firebase/firestore"; 
import { auth } from '../config/firebase';

import { ChatScreen } from "./chatscreen";
import { ChatInput } from "./chatinput";

export function Chat() {
  const [temp, setTemp] = useState();
  
  return (
    <div className="chat">
      <MainHeader></MainHeader>
      <ChatScreen></ChatScreen>
      <ChatInput></ChatInput>
    </div>
  );
}

function MainHeader(){
  return(
    <div className="main-header">
      Your chatting with ... {auth.currentUser?.displayName}
    </div>
  );
}