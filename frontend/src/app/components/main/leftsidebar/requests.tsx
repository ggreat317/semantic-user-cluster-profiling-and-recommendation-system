import { useState, useEffect } from 'react';
import { useAuth } from '../../homepage/auth';
import { getFriendRequests } from '../api/request';
import { acceptFriendRequest } from '../api/request';

type Setter = React.Dispatch<React.SetStateAction<string>>

type PublicData = {
  from: string;
  fromName: string;
  id: string;
  time: string;
}

type PublicUser = {
  userID: string;
  userName: string;
  time: Date;
};

export function RequestBar({setSidebar} : {setSidebar: Setter}) {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!user) {
      setUsers([]);
      return;
    }

    async function loadRequests(){
      const data: Record<string, PublicData> = await getFriendRequests();
      if(!data){
        return setUsers([])
      }
      const list = Object.values(data)
        .map((u : PublicData) => ({
          userID: u.from,
          time: new Date(u.time),
          userName: u.fromName
        }))
        .sort((a, b) => a.time.getTime() - b.time.getTime());
      setUsers(list);
    }

    loadRequests();

  }, [user, loading]);

  return (
    <div className="sidebar">
      <div className="top">
				<span className="text big">Requests</span>
			</div>
			<div className="tabs">
        {users.map((u) => (
          <div key={u.userID}>
             <ProfileRow
              userID={u.userID}
              userName={u.userName}
            />
          </div>
        ))}
			</div>
			<div className=" bottom">
        <MenuButton
          name="Exit Requests"
          set={() => setSidebar("")}
        />
			</div>
    </div>
  );
}

function ProfileRow({ userID, userName }: {userID: string; userName: string;}) {

  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if(!userName){ return; }
  async function loadProfile() {
    if (profile || loading) return;

    /*setLoading(true);
    const db = getDatabase();
    const snap = await get(ref(db, `profiles/${userID}`));

    if (snap.exists()) {
      setProfile(snap.val().about);
    }*/

    setProfile("nothing to see here");
    setLoading(false);
  }

  function handleToggle() {
    setOpen((o) => !o);
    if (!open) loadProfile();
    
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
          {!loading && profile && <div>{profile}</div>}
        </div>
      )}

      <div>
        <AcceptRejectButtons recipientID={userID} />
      </div>
    </div>
  );
}

function AcceptRejectButtons({ recipientID }: { recipientID: string }) {
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("");

  async function handleAccept(e: React.MouseEvent) {
    e.stopPropagation();
    setProcessing(true);
    try {
      await acceptFriendRequest(recipientID)
      setStatus("accept");
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  }

  async function handleReject(e: React.MouseEvent) {
    e.stopPropagation();
    setProcessing(true);
    try {
      setStatus("reject");
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex gap-2">
      {status !== "reject" &&
      <button
        className="button accept"
        disabled={processing || status=="accept"}
        onClick={handleAccept}
      >
        {status == "" ? "Accept" : "Accepted"}
      </button>}

      {status !== "accept" && 
      <button
        className="button reject"
        disabled={processing || status=="reject"}
        onClick={handleReject}
      >
        {status == "" ? "Reject" : "Rejected"}
      </button>}
    </div>
  );
}

function MenuButton({name, set} : {name : string, set: Setter}){
	return(
		<button 
			className="button menu-button"
			onClick={() => set(name)}
		>{name}</button> 
	);
}