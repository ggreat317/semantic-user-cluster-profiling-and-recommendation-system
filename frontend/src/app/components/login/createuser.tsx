"use client"

import { API_URL } from "../main/api/token";
import { useState } from 'react';
import { auth } from '../../config/firebase';
import { signInWithCustomToken, fetchSignInMethodsForEmail } from 'firebase/auth';

export function CreateUser({ setCreate } : { setCreate : React.Dispatch<React.SetStateAction<boolean>>}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [password1, setPassword1] = useState("");
  const [emailError, setEmailError] = useState("");
  const [userError, setUserError] = useState("");
  const [pwError, setPWError] = useState("");
  const [cpwError, setCPWError] = useState("");

  // handles varius good and bad inputs
  function handleInput(e : React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    switch (name) {
      case ("Email"):
        if (!(value.trim() === value)) {
          setEmailError("no outer spaces");
          setEmail("");
        } else {
          setEmailError("");
          setEmail(value);
        }

        if (value.length < 1) {
          setEmailError("");
        }
        break;

      case ("Username"):
        if (!(value.trim() === value)) {
          setUserError("no outer spaces");
          setName("");
        } else if (value.length > 19) {
          setUserError("too long");
          setName("");
        } else if (value.length < 3) {
          setUserError("too short")
          setName("");
        } else {
          setUserError("");
          setName(value);
        }
        if (value.length < 1) {
          setUserError("");
          setName("");
        }
        break;

      case ("Password"):
        if (!(value.trim() === value)) {
          setPWError("no outer spaces");
          setPassword1("");
        } else if (value.length > 6) {
          setPWError("");
          setPassword1(value);
        } else if (value.length > 0) {
          setPWError("too weak");
          setPassword1("");
        } else {
          console.log("wtf how did you get here");
        }
        break;

      case ("Confirm Password"):
        if (value === password1) {
          setCPWError("");
          setPassword(value);
        } else if (value.length > 6) {
          setCPWError("make it match");
          setPassword("");
        } else {
          setCPWError("");
          setPassword("");
          console.log("wtf howwwwwww")
        }
        break;
    }
  }

  // attempts to create an account via password
  const createAccount = async () => {
    if (!(email && name && password)) {
      if (!email) {
        setEmailError("Enter your email");
      }
      if (!name) {
        setUserError("Enter a valid username");
      }
      if (!password1) {
        setPWError("Enter a valid password");
        return;
      }
      if (!password) {
        setCPWError("Enter your password");
      }
      return;
    }

    const signinMethods = await fetchSignInMethodsForEmail(auth, email);

    if (signinMethods.includes('google.com')) {
      setEmailError("Already associated with Google Account...awkward");
      return;
    }

    const res = await fetch(`${API_URL}/account`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, displayName: name })
    });

    const data = await res.json();

    if (res.ok) {
      await signInWithCustomToken(auth, data.firebaseToken);
    } else {
      console.error(data.error);
    }

  };

  return (
    <div className="floatPage">
      <div className="userBox">
        <div className="userInputs">
          <Input handleInput={handleInput} name={"Email"} error={emailError}></Input>
          <Input handleInput={handleInput} name={"Username"} error={userError}></Input>
          <Input handleInput={handleInput} name={"Password"} error={pwError}></Input>
          <Input handleInput={handleInput} name={"Confirm Password"} error={cpwError}></Input>
        </div>
        <button className="signin-text signin-button-main" onClick={createAccount}>Create User</button>
      </div>
      <div className="infos">
        <button className="signin-text">Just a button</button>
        <button className="signin-text signin-button-side" onClick={createAccount}>Create user</button>
        <button className="signin-text signin-google" onClick={() => setCreate(false)} >Go Back</button>
      </div>
    </div>
  );
}



function Input({ handleInput, name, error }: { handleInput: (e: React.ChangeEvent<HTMLInputElement>) => void, name: string, error: string }) {
  return (
    <div className="meta">
      {error ? <span className="metaname e error">{name + " - " + error}</span> : <span className="metaname e">{name}</span>}
      <input
        type={(name.includes("Password")) ? 'password' : 'text'}
        name={name}
        className="signin-input nogoogle"
        onChange={(e) => handleInput(e)}>
      </input>
    </div>
  );
}

