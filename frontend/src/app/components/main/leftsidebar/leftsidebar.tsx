'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '../../homepage/auth';
import { loadRooms } from '../api/selfGet';

import { DefaultBar } from './default';
import { SettingBar } from './settings';
import { OptionBar } from './customization/options';
import { SliderBar } from './customization/sliders'
import { RequestBar } from './requests';
import { FriendsBar } from './friends';

const SELECTION = [
  "text", "border", "side", "button", "hover",
  "header", "chat", "time", "foot", "input", "send"
] as const;

type ThemeKey = typeof SELECTION[number];
type Theme = Record<ThemeKey, string>;

const DARK_THEME: Theme = {
  text: "#fefeff",
  border: "#222223",
  side: "#232428",
  button: "#232428",
  hover: "#b9bbbe",
  header: "#23272a",
  chat: "#313338",
  time: "#b9bbbe",
  foot: "#383a40",
  input: "#202225",
  send: "#5865f2",
};

export type Setter = React.Dispatch<React.SetStateAction<string>>;



export type Room = {
  _id: string;
  name: string;
  type: string;
  lastAccessed: string;
  users: {
    uid: string;
    lastActive: Date;
  }[]
};

export function LeftSidebar() {

	const [sidebar, setSidebar] = useState("");
	const [custom, setCustom ] = useState("");
	const [customTheme, setCustomTheme] = useState<Theme>(DARK_THEME)

  const { user } = useAuth();
  const [ rooms, setRooms ] = useState<Room[]>([]);

  useEffect(() => {
    if (!user) return;

    let active = true;

    async function loadInitial() {
      try {
        const initial = await loadRooms();
        if (!active) return;
        setRooms(initial);
      } catch (err) {
        console.error(err);
      }
    }

    loadInitial();
    return () => {
      active = false;
    };
  }, [user]);

  const sortByLastAccessed = (a: Room, b: Room) =>
    new Date(b.lastAccessed).getTime() -
    new Date(a.lastAccessed).getTime();

  const friendMessages = rooms
    .filter(room => room.type === "F")
    .sort(sortByLastAccessed);

  const directMessages = rooms
    .filter(room => room.type === "D")
    .sort(sortByLastAccessed);

  const groupChats = rooms
    .filter(room => room.type === "G")
    .sort(sortByLastAccessed);
    

	return (
		<div>
			{sidebar === "" && <DefaultBar setSidebar={setSidebar} directMessages={directMessages} groupChats={groupChats}></DefaultBar>}
			{sidebar === "settings" && <SettingBar setSidebar={setSidebar}></SettingBar>}
			{sidebar === "options" && <OptionBar setSidebar={setSidebar} setCustom={setCustom} setCustomTheme={setCustomTheme}></OptionBar>}
			{sidebar === "sliders" && <SliderBar setSidebar={setSidebar} custom={custom} customTheme={customTheme}></SliderBar>}
			{sidebar === "requests" && <RequestBar setSidebar={setSidebar}></RequestBar>}
      {sidebar === "friends" && <FriendsBar setSidebar={setSidebar} friendMessages={friendMessages}></FriendsBar>}
		</div>
	);
}

export function MenuButton({className, name, set} : {className:string, name : string, set: Setter | Promise<void> | void}){
	if(typeof set === "function"){
		return(
			<button 
				className={"button menu-button " + className}
				onClick={() => set(name)}
			>{name}</button> 
		);
	}else{
		return(
			<button 
				className={"button menu-button " + className}
				onClick={() => set}
			>{name}</button> 
		);
	}
}
