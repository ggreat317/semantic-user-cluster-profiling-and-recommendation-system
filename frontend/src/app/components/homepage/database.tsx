"use client"

import { createContext, useState, useEffect, ReactNode, useContext, Dispatch, SetStateAction } from 'react';
import { getDatabase, ref, set, onDisconnect, onValue, update, DatabaseReference } from "firebase/database";
// import { db } from '../../config/firebase';
// import { doc, setDoc, } from "firebase/firestore";
import { useAuth } from './auth';

interface DBContextType { 
  //userID: string;
  //setUserID: Dispatch<SetStateAction<string>>;
  //userName: string | null;
  //setUserName: Dispatch<SetStateAction<string | null>>;
  profile: string;
  setProfile: Dispatch<SetStateAction<string>>; 
  custom : string | null;
  setCustom: Dispatch<SetStateAction<string>>;
  chats : string[] | null;
  setChats: Dispatch<SetStateAction<string[]>>;
}

const DBContext = createContext<DBContextType | undefined>(undefined)
const defaultCustom = '{"text":"#fefeff","border":"#22223","side":"#232428","button":"#232428","hover":"#b9bbbe","header":"#23272a","chat":"#313338","time":"#b9bbbe","foot":"#383a40","input":"#202225","send":"#5865f2"}'

export function DataBase({ children }: { children: ReactNode }){

  const { user, loading } = useAuth();
  //const [userID, setUserID] = useState<string>("")
  //const [userName, setUserName] = useState<string | null>("")
  const [profile, setProfile] = useState("");
  const [custom, setCustom] = useState<string>(defaultCustom);
  const [chats, setChats] = useState<string[]>(["miC9tkmJGE94KwdePAC1"]);
  const [userRef, setUserRef] = useState<DatabaseReference>()
  const rtdb = getDatabase();

  useEffect(() => {
    if(loading){return;}
    if(!user){return;}
    setUserRef(ref(rtdb, `users/${user.uid}`));
    onDisconnect(ref(rtdb, `users/${user.uid}`)).remove()
  }, [loading, user])

  useEffect(() => {
    if(!user || !userRef){return;}
    const listener = onValue(userRef, (snapshot) => {
      const data = snapshot.val() || {};
      if(!data.userID){
        update(userRef,{userID : user.uid});
      }

      if(!data.userName){
        update(userRef,{userName : user.displayName});
      }

      if(!data.profile){
        update(userRef,{profile : profile});
      }else{
        setProfile(data.profile);
      }

      if(!data.custom){
        update(userRef,{custom : custom});
      }else{
        setCustom(data.custom);
      }

      if(!data.chats){
        update(userRef,{chats : chats});
      }else{
        setChats(data.chats);
      }
  });

  return listener;
  }, [userRef])

  useEffect(() => {
    if(!user){return;}
    if(!userRef){return;}
    update(userRef, {custom: custom})
    const mapCustom = JSON.parse(custom as string) as Record<string,string>;
    Object.entries(mapCustom).forEach(([name, color]) => {
      if (color){
        document.documentElement.style.setProperty(`--${name}`, color);
      }
		});
  }, [custom])

  useEffect(() => {
    if(!user){return;}
    if(!userRef){return;}
    update(userRef, {profile: profile})
  }, [profile])

  useEffect(() => {
    if(!user){return;}
    if(!userRef){return;}
    update(userRef, {chats: chats})
  }, [chats])
  
/*

  useEffect(() => {
    set(userRef, {
      userID: user.uid,
      userName: user.displayName,
      profile: profile,
      custom: custom,
      chats: chats
    });
    //update(userRef, {custom:"hi"})
    // -> onDisconnect(userRef).remove();
  }, [loading, profile, custom, chats])
  */
  return (
    <DBContext.Provider value={{profile, setProfile, custom, setCustom, 
                                chats, setChats}}>
      {children}
    </DBContext.Provider>
  )
}

export function useDataBase(){
  const context = useContext(DBContext);
  if (!context) { throw new Error("no DB provider") };
  return context;
}


