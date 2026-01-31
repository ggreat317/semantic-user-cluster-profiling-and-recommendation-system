"use client"

import { useState, useEffect } from 'react';

import { auth, googleProvider } from '../../config/firebase';
import { signInWithEmailAndPassword, signInWithPopup, fetchSignInMethodsForEmail, signOut } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';


export function LogIn({ setCreate } : { setCreate : React.Dispatch<React.SetStateAction<boolean>> }) {
  // const router = useRouter();
  // router.push('/signin');
  const [titleCard, setTitleCard] = useState("");
  const [smallTitleCard, setSmallTitleCard] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [pwError, setPWError] = useState("");
  const [refresh, setRefresh] = useState(0);

  // attempts a sign in via password and tells users if bad input
  const signIn = async () => {

    if (email) {
      const signinMethods = await fetchSignInMethodsForEmail(auth, email);
      console.log(email)
      console.log(signinMethods)
      if (signinMethods.includes('google.com')) {
        setEmailError("Already associated with Google Account...awkward");
        return;
      }
    }
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      console.log("ERROR ERROR ERROR");
      console.log(err);
      if (err instanceof FirebaseError) {
        const code = err.code;
        console.log(code);
        switch (code) {
          case "auth/invalid-email":
            setEmailError("Invalid email");
            break;
          case "auth/user-disabled":
            setEmailError("User account disabled");
            break;
          case "auth/user-not-found":
            setEmailError("No user with this email");
            break;
          case "auth/wrong-password":
            setPWError("Wrong password");
            break;
          case "auth/too-many-requests":
            setEmailError("too many login attempts.");
            setPWError("Too many login attempts.");
            break;
          default:
            console.log("Login failed: ", err.message);
            setEmailError("Login failed");
            setPWError("Login failed");
        }
        return;
      }
    }
    console.log("Attempted Sign In With Email and Password");
    console.log("Current email: " + auth.currentUser?.email);
    console.log("Current uID: " + auth.currentUser?.uid);
  };

  // attempts a sign in via google auth
  const signInWithGoogle = async () => {

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.log("ERROR ERROR ERROR");
      console.log(err);
      return;
    }
    console.log("Attempted Sign In With Google");
    console.log("Current email: " + auth.currentUser?.email);
    console.log("Current uID: " + auth.currentUser?.uid);

    const user = auth.currentUser;

    if (user?.email) {
      const signinMethods = await fetchSignInMethodsForEmail(auth, user.email);

      if (!signinMethods.includes('password')) {
        return;
      }

      setEmailError("Already associated with Password...awkward");
      try {
        await signOut(auth);
        console.log("Intercepted Google Login");
      } catch (error) {
        console.error("Interception failed: ", error);
      }
    }
  };

  // handles user inputs
  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    switch (name) {
      case ("Email"):
        setEmail(value);
        setEmailError("");
        break;
      case ("Password"):
        setPassword(value);
        setPWError("");
        break;
      default:
        console.log("strange occurences...");
    }
    return;
  }

  function create(set: boolean) {
    setCreate(set);
    setRefresh(refresh + 1);
  }

  useEffect(() => {

    const smallTitleCards = [
      "MURMUR", "Log In", "MURMUR", "Log In", "murmur", "Log In", "MURMUR", "Log In", "Get In", "MURMUR", "MURMUR",
      "Log In", "MURMUR", ":) ;) :)", "murmur",
    ];

    const bigTitleCards = [
      "Welcome Murmurer", "Enjoy Murmur", "#livelaughmurmur", "Quiet Voices", "***** ****", "***** ****"
    ];

    const titleCards = smallTitleCards.concat(bigTitleCards);

    if (refresh === 1) {
      setTitleCard("new user?");
    } else if (refresh > 5) {
      setTitleCard("again?");
    } else {
      setTitleCard(titleCards[Math.floor(Math.random() * titleCards.length)]);
      setSmallTitleCard(smallTitleCards[Math.floor(Math.random() * smallTitleCards.length)]);
    }
  }, [titleCard, refresh])

  return (
    <div className="floatPage">
      <div className="userBox">
        <span className="titleCard rTitle">{titleCard}</span>
        <span className="titleCard sTitle">{smallTitleCard}</span>
        <div className="userInputs">
          <Input handleInput={handleInput} name={"Email"} error={emailError}></Input>
          <Input handleInput={handleInput} name={"Password"} error={pwError}></Input>
        </div>
        <button className="signin-text signin-button-main" onClick={signIn}>Sign In</button>
      </div>
      <div className="infos">
        <button className="signin-text" onClick={() => create(true)}>Create User</button>
        <button className="signin-text signin-button-side" onClick={signIn}>Sign In</button>
        <button className="signin-text signin-google">Google Sign In Down</button>
      </div>
    </div>
  );
}

function Input({ handleInput, name, error }: { handleInput: (e: React.ChangeEvent<HTMLInputElement>) => void, name: string, error: string }) {
  return (
    <div className="meta">
      {error ? <span className="metaname error">{name + " - " + error}</span> : <span className="metaname">{name}</span>}
      <input
        type={(name.includes("Password")) ? 'password' : 'text'}
        name={name}
        className="signin-input"
        onChange={(e) => handleInput(e)}>
      </input>
    </div>
  );
}
