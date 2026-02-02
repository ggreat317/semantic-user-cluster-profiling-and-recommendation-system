import { useState, useEffect } from 'react';
import { sendFriendRequest } from '../api/request';
import { loadOtherUMAP, loadSelfUMAP } from '../api/profiles';
import ProfileUMAP from './profileUMAP';
import { User } from 'firebase/auth';

import { getDatabase, ref, onValue } from 'firebase/database';

type PublicUserRTDBMap = {
  [userID : string]: {
    userName: string;
  }
};

type PublicUser = {
  userID: string;
  userName: string;
};


export function Profiles({user, room} : {user : User, room : string}) {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const db = getDatabase();

  // listener from rtdb to display current room users
  // security already set up in the rtdb and backend

  useEffect(() => {
    if (!user || !room) {
      return setUsers([]);
    }

    // gets reference from rtdb
    const membersRef = ref(db, `rooms/${room}/members/users`);

    // grabs data at reference
    const unsubscribe = onValue(membersRef, snapshot => {
      const data : PublicUserRTDBMap = snapshot.val() ?? {};

      // alphabetically sorts the member list
      const memberList = Object.entries(data)
        .filter(([id]) => id !== user.uid)
        .map(([id, u]: any) => ({
          userID: id,
          userName: u.userName
        }))
        .sort((a, b) => a.userName.localeCompare(b.userName));
      
      // sets users to member list
      setUsers(memberList)
    })

    return ()=>unsubscribe();

  }, [db, room]);


  return (
    <div className="profiles">
      {users.map((u) => (
        <ProfileRow
          key={u.userID}
          userID={u.userID}
          userName={u.userName}
          self={false}
          best={false}
        />
      ))}
    </div>
  );
}

export function ProfileRow({ userID, userName, self, best }: {userID: string, userName: string, self: boolean, best: boolean}) {

  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<[]>([])
  const [loading, setLoading] = useState(false);

  if(!userName){ return; }

  async function loadProfile() {
    console.log("loading")
    if (loading) return;
    setLoading(true);
    try{
      console.log("im trying to load the umap");
      console.log(userID)
      const profile = self ? await loadSelfUMAP() : await loadOtherUMAP(userID)
      setProfile(profile);
      console.log("pass")
    }catch{
      console.log("fail")
      setLoading(false);
    }
    setLoading(false);
  }

  function handleToggle() {
    setOpen((state) => !state);
    if (!open) loadProfile(); 
  }

  return (
    <div className={`${self||best ? "menuProfile" : "profile"} ${open ? "open" : ""}`}>
      {self||best ? 
        <button className="button" onClick={handleToggle}>
            {userName}
        </button>
      :
        <button className="userinfo" onClick={handleToggle}>
          <div className="pfp">{userName.slice(0, 2)}</div>
          <div className="usernameHolder">
            <div className="username">{userName}</div>
          </div>
        </button>
      }

      {open && (
        <div className="aboutme">
            {!loading && profile.length != 0 && <ProfileUMAP profile={profile} self={self}></ProfileUMAP>}
          <div>
            {loading && <div>Loading...</div>}
            {!loading && profile.length === 0 && <div>Not Enough Messsages for Profile Display</div>}
            {!self && <FriendButton recipientID={userID} />}
          </div>
        </div>
      )}
    </div>
  );
}

function FriendButton({ recipientID }: { recipientID: string }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [request, setRequest] = useState("Add Friend")

  async function send(e: React.MouseEvent) {
    e.stopPropagation();
    setSending(true);

    try {
      await sendFriendRequest(recipientID);
      setSent(true);
    } catch (err) {
      console.log("Friend request error: ",err)
      // setRequest(err.toString())
    } finally {
      setSending(false);
    }
  }

  return (
    <button className="button" disabled={sending || sent} onClick={send}>
      {sent ? "Request Sent" : sending ? "Sending..." : request}
    </button>
  );
}



// Old Code


  // useEffect(() => {
  //   if (!db || !room) return;

  //   const unsubscribe = onSnapshot(doc(db, "roomVault", room), (snapshot)=> {
  //     if (!snapshot.exists()) {
  //       return
  //     }
  //     if 
  //     const users = snapshot.data().users


  //     const liveMessages = snapshot.docs.map(doc => {
  //       const data = doc.data();
  //       return{
  //         text: data.text,
  //         time: data.time.toDate(),
  //         ownerID: data.ownerID,
  //         userName: data.userName,
  //         id: doc.id
  //       };
  //     });
  //     setMessages(prev => {
  //       const existingIds = new Set(prev.map(m => m.id));
  //       const newMessages = liveMessages.filter(m => !existingIds.has(m.id));
  //       return [...prev, ...newMessages];
  //     })
  //   });

  //   return () => unsubscribe();
  // }, [room, db])


  // useEffect(() => {
  //   if (!user || !room) {
  //     return setUsers([]);
  //   }

  //   onValue(usersRef, (snapshot) => {
  //     if (!snapshot.exists()) return;

  //     const data = snapshot.val();

  //     const list = Object.entries(data)
  //       .filter(([id]) => id !== user.uid)
  //       .map(([id, u]: any) => ({
  //         userID: id,
  //         userName: u.userName
  //       }))
  //       .sort((a, b) => a.userName.localeCompare(b.userName));

  //     setUsers(list);
  //   });

  //   return () => off(usersRef);
  // }, [user, loading]);