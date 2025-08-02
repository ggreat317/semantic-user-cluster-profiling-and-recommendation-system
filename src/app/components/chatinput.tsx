import { useState, useRef, useEffect } from "react";
import { auth } from '../config/firebase';
import { db } from "../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; 

export function ChatInput() {
  const [text, setText] = useState('');
  // const [messages, setMessages] = useState("");

  const handleMessage = (e : React.FormEvent) => {
    e.preventDefault();
    if (text.trim() === "") return;
    handleMessageSubmit();
    setText("");
  }

  const messagesCollection = collection(db, "messages")
  const handleMessageSubmit = async () => {
    try{
    await addDoc(messagesCollection,{
        text: text,
        time: serverTimestamp(),
        userID: auth.currentUser?.uid,
        userName: auth.currentUser?.displayName
      }
    )}catch(err){
      console.log(err)
    }
  }

  return(
    <form className="main-message fix" onSubmit={handleMessage}>
      <input 
        className="input message-input" 
        placeholder="Type Message..."
        onChange={(event) => setText(event.target.value)}
        value={text}
      ></input>
      <button className="button message-send">Send</button>
    </form>
  )
}
