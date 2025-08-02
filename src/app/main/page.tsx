"use client"

import '../css/main.css';

import {Chat} from '../components/chat';
import '../css/chat.css';

import {LeftSidebar} from '../components/leftsidebar';
import '../css/leftsidebar.css';

import{Match} from '../components/match';
import '../css/match.css';

import { useState } from "react";

export default function Home() {
  return(
    <div className="Murmur">
      <LeftSidebar></LeftSidebar>
      <Chat></Chat>
      <Match></Match>
    </div>
  );
}