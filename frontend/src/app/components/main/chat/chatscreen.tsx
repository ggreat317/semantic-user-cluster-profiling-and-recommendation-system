import { useState, useRef, useEffect } from "react";
import { db } from "../../../config/firebase";
import { collection, query, orderBy, startAfter, onSnapshot, Timestamp } from "firebase/firestore";
import { useAuth } from '../../homepage/auth';
import { loadOlderMessages, normalizeDate } from '../api/get.js';
import { User } from "firebase/auth";

export function ChatScreen({user, room} : {user : User, room : string}) {

  type FirestoreMessage = {
    text: string;
    time: Date;
    ownerID: string;
    userName: string;
    id: string;
  }

  const [messages, setMessages] = useState<FirestoreMessage[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const topRef =  useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isAtBottom){
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAtBottom]);

  useEffect(() => {
    if (!room){
      return setMessages([]);
    };

    let active = true;
    async function loadInitial() {
      try{
        const initial = await loadOlderMessages(room, new Date(), 50);
        if (!active) return;
      
        setMessages(initial);
        setHistoryLoaded(true);
      }catch(err){
        console.log(err)
      }
    }
    loadInitial();
    return () => {
      active = false;
    };
  }, [user, room]);



  useEffect(() => {
    if (!historyLoaded || !db || !room) return;
    let q;
    const latestTime = messages[messages.length - 1]?.time;
    
    if(latestTime){
      const latestTimestamp = Timestamp.fromDate(new Date(latestTime))
      q = query(
        collection(db, "rooms", room, "messages"),
        orderBy("time", "asc"),
        startAfter(latestTimestamp)
      );
    }else{
      q = query(
        collection(db, "rooms", room, "messages"),
        orderBy("time", "asc"),
      );
    }

    const unsubscribe = onSnapshot(q, snapshot => {
      const liveMessages = snapshot.docs.map(doc => {
        const data = doc.data();
        return{
          text: data.text,
          time: data.time.toDate(),
          ownerID: data.ownerID,
          userName: data.userName,
          id: doc.id
        };
      });
      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const newMessages = liveMessages.filter(m => !existingIds.has(m.id));
        return [...prev, ...newMessages];
      })
    });

    return () => unsubscribe();
  }, [room, db, historyLoaded])

  const chatMessage = messages.map((message) => {
    const time = normalizeDate(message.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    return (
      <div key={message.id}>
        <Message user={message.userName} text={message.text} time={time}></Message>
      </div>
    );
  })

  const handleScroll = async () => {
    if (!topRef.current) return;
    const current = topRef.current
    if (current.scrollTop === 0){
      const oldestMessage = messages[0];
      if (!oldestMessage) return;

      const olderMessages = await loadOlderMessages(room, oldestMessage.time, 50);
      if (olderMessages.length === 0) return;

      setMessages(prev => [...olderMessages, ...prev])
    }

    const threshold = 100;
    const atBottom = current.scrollHeight - current.scrollTop - current.clientHeight < threshold;

    setIsAtBottom(atBottom);
  }

  return (
    <div 
      className="main-chat-screen"
      ref={topRef} 
      onScroll={handleScroll}
      >
      {user && <div>{chatMessage}</div>}
      <div ref={bottomRef} />
    </div>
  );
}

function Message({ user, text, time }: { user: string; text: string; time: string }) {
  return (
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

