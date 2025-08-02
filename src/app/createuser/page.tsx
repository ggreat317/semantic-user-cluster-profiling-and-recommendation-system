"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../config/firebase';
import { updateProfile } from 'firebase/auth';

import '../css/signin.css'

export function CreateUser() {
  const [signInPage,setSignInPage] = useState(0);
  const [userName, setUserName] = useState("");
  const [userAbout, setUserAbout] = useState("");
  const router = useRouter();

  const user = auth.currentUser;

  function handleInput(e : string){
    if (signInPage===0){
      if(e.length<19){
        setUserName(e);
      }
    }else{
      if(e.length<70){
        setUserAbout(e);
      }
    }
  }


  const handleSubmit = (e : React.FormEvent) => {
    e.preventDefault();

    if (signInPage===0){
      if (userName.trim() === "") return;
      updateProfile(user, {
        displayName: userName
      }).then(() => {
        console.log("Display name updated!");
        console.log(user?.displayName)
      }).catch(err => {
        console.log(err);
      });

      setSignInPage(signInPage + 1);
    }else{
      if (userAbout.trim() === "") return;
      router.push('/main');
    }
  }


  return(
    <div className="floatpage">
        <form className="userCollection" onSubmit={handleSubmit}>
          {signInPage===0 && <SignInUser handleInput={handleInput} userName={userName}></SignInUser>}
          {signInPage===1 && <SignInAbout handleInput={handleInput} userAbout={userAbout}></SignInAbout>}
          {signInPage===0 && <button className="signin-text">Next</button>}
          {signInPage===1 && <button className="signin-text">Log In</button>}
        </form>
    </div>
  );
}




function SignInUser({handleInput, userName} : {handleInput: (value:string)=>void; userName: string}){
  return(
    <div className="info">
      <input 
        className="signin-input" 
        placeholder="Enter any Username"
        onChange={(e) => handleInput(e.target.value)}
        value={userName}
        ></input>
    </div>
  );
}

function SignInAbout({handleInput, userAbout} :  {handleInput: (value:string)=>void; userAbout: string}){
  return(
    <div className="info">
      <textarea 
        className="signin-input ab" 
        placeholder="Tell us about yourself...keep it short"
        onChange={(e) => handleInput(e.target.value)}
        value={userAbout}
        ></textarea>
    </div>
  );
}