import { useState, useEffect } from 'react';
import { useAuth } from '../../homepage/auth';
import { getDatabase, ref, onValue, off} from "firebase/database";
import { sendFriendRequest } from '../api/request';
import { loadOtherUMAP } from '../api/profiles';
import ProfileUMAP from './profileUMAP';

type PublicUser = {
  userID: string;
  userName: string;
};

export function Profiles() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!user) {
      setUsers([]);
      return;
    }

    const db = getDatabase();
    const usersRef = ref(db, "users");

    onValue(usersRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const data = snapshot.val();

      const list = Object.entries(data)
        .filter(([id]) => id !== user.uid)
        .map(([id, u]: any) => ({
          userID: id,
          userName: u.userName
        }))
        .sort((a, b) => a.userName.localeCompare(b.userName));

      setUsers(list);
    });

    return () => off(usersRef);
  }, [user, loading]);

  return (
    <div className="profiles">
      {users.map((u) => (
        <ProfileRow
          key={u.userID}
          userID={u.userID}
          userName={u.userName}
        />
      ))}
    </div>
  );
}

function ProfileRow({ userID, userName }: {userID: string; userName: string;}) {

  const [open, setOpen] = useState(false);
  const [points, setPoints] = useState<number[][]>([])
  const [loading, setLoading] = useState(false);

  if(!userName){ return; }

  async function loadProfile() {
    if (loading) return;
    setLoading(true);
    console.log("test");
    const coords = await loadOtherUMAP(userID);
    console.log(coords);
    console.log(coords);
    setPoints(coords);
    setLoading(false);
  }

  function handleToggle() {
    console.log("loading")
    setOpen((state) => !state);
    if (!open) loadProfile(); // fetch only once
  }

  return (
    <div className={`profile ${open ? "open" : ""}`}>
      <button className="userinfo" onClick={handleToggle}>
        <div className="pfp">{userName.slice(0, 2)}</div>
        <div className="usernameHolder">
          <div className="username">{userName}</div>
        </div>
      </button>

      {open && (
        <div className="aboutme">
            {loading && <div>Loading...</div>}
            {!loading && points && <ProfileUMAP points={points}></ProfileUMAP>}
          <div>
            <FriendButton recipientID={userID} />
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


