"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { auth, googleProvider } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';

import '../css/signin.css'


export function Auth({signedIn}) {
  //const router = useRouter();
  //router.push('/signin');
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const signIn = async() => {
    try{
    await createUserWithEmailAndPassword(auth, email, password)
    } catch(err){
      console.log("ERROR ERROR ERROR")
      console.log(err)
    }
    console.log("Attempted Sign In With Email and Password")
    console.log("Current email: " + auth.currentUser?.email)
    console.log("Current uID: " + auth.currentUser?.uid)
    signedIn(auth.currentUser?.uid)
  };

  const signInWithGoogle = async() => {
    try{
    await signInWithPopup(auth, googleProvider).then({signedIn});
    } catch(err){
      console.log("ERROR ERROR ERROR")
      console.log(err)
    }
    console.log("Attempted Sign In With Google")
    console.log("Current email: " + auth.currentUser?.email)
    console.log("Current uID: " + auth.currentUser?.uid)
    signedIn(auth.currentUser?.uid)
  }; 

  const logOut = async() => {
    try{
    await signOut(auth);
    } catch(err){
      console.log("ERROR ERROR ERROR")
      console.log(err)
    }
    console.log("Attempted Log Out")
    console.log("Current email: " + auth.currentUser?.email)
    console.log("Current uID: " + auth.currentUser?.uid)
  }; 

  return(
    <div className="floatpage">
      <div className="userBox">
        <input 
          placeholder="Email..." 
          className="signin-input"
          onChange={(e) => setEmail(e.target.value)}>

        </input>
        <input 
          placeholder="Password..." 
          className="signin-input"
          onChange={(e) => setPassword(e.target.value)}>
        </input>
      </div>
      <div className="info">
        <button className="signin-text" onClick={signIn}>Sign in</button>
        <button className="signin-text" onClick={signInWithGoogle}>Sign in with Google</button>
        <button className="signin-text" onClick={logOut}>Log Out</button>
      </div>
    </div>
  );
}
