import { User } from 'firebase/auth';
import { Profiles } from './profiles';

export function RightSidebar({user, room} : {user: User, room : string}) {

  return (
    <div className="match">
      <div className="text big">murmur</div>
      <div className="profiles">
        <Profiles user={user} room={room}></Profiles>
      </div>
    </div>
  );
}

