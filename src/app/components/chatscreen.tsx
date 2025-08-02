import { useState, useRef, useEffect } from "react";
import { db } from "../config/firebase";
import { getDocs, collection, query, orderBy, onSnapshot } from "firebase/firestore"; 

export function ChatScreen(){
  const [messages, setMessages] = useState([]);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getMessagesCollection = collection(db, "messages");
  const getMessages = async () => {
      try{
        const data = await getDocs(getMessagesCollection)
        const filteredData = data.docs.map((doc) =>({...doc.data(),id:doc.id}))
        filteredData.map((metaMessage) => setMessages([...messages, {user: metaMessage.userName, text: metaMessage.text, time: metaMessage.time} ]))

      }catch(err){
        console.log(err);
      }
      console.log("message retrival")
    };

  useEffect(() => {
    const snapMessagesCollection = query(collection(db, "messages"), orderBy("time", "asc"));

    const snapMessages = onSnapshot(snapMessagesCollection, (snapshot) =>{
      const filteredData = snapshot.docs.map((doc) =>({...doc.data(),id:doc.id}));
      console.log("test")
      setMessages(filteredData);
  })
    
    return snapMessages;
  }, [])

  function test(){
    console.log(messages);
  }

  const chatMessage = messages.map((message) => {

    let time = message.time ? message.time.toDate().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

    return(
      <div key={message.id}>
        <Message user={message.userName} text={message.text} time={time}></Message>
      </div>
    );
  })

  return(
    <div className="main-chat-screen">
      <div>{chatMessage}</div>
      <div ref={bottomRef}/>
    </div>
  );
}

function Message({user, text, time} : {user:string; text:string; time:any}){
return(
  <div className="message">
    <div className="message-pfp">{user[0]}</div>
    <div className="message-info">
      <div className="message-meta">
        <div className="message-user">{user}</div>
        <div className="message-time">{time}</div>
      </div>
      <div className="message-message">{text}</div>
    </div>
  </div>
);
}