import { auth } from '../../../config/firebase';

import { ChatScreen } from "./chatscreen";
import { ChatInput } from "./chatinput";
import { User } from 'firebase/auth';

export function Chat({user, room} : {user : User, room : string}) {

  return (
    <div className="chat">
      <MainHeader></MainHeader>
      <ChatScreen user={user} room = {room}></ChatScreen>
      <ChatInput room={room}></ChatInput>
    </div>
  );
}

function MainHeader() {
  return (
    <div className="main-header">
      Your chatting as ... {auth.currentUser?.displayName}
    </div>
  );
}