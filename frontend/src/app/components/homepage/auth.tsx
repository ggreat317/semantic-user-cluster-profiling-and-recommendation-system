"use client"

import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { DataBase } from './database';


type Setter = React.Dispatch<React.SetStateAction<string>>

interface AuthContextType { 
  user: User | null; 
  loading: boolean;
  room: string;
  setRoom: Setter;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, room: "", setRoom: () => {} })

export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState("general");

  useEffect(() => {
    const listener = onAuthStateChanged(auth, (user) => { 
      setUser(user);
      setLoading(false);
    })
    return () => listener();
  }, [room])

  return (
    <AuthContext.Provider value={{ user, loading, room, setRoom }}>
      <DataBase>
      {children}
      </DataBase>
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) { throw new Error("no auth provider") };
  return context;
}

