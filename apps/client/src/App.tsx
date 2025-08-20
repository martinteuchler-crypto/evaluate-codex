import React, { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import Board from './Board';
import create from 'zustand';

interface State {
  socket: Socket | null;
  state: any;
  setSocket: (s: Socket) => void;
  setState: (s: any) => void;
}

const useStore = create<State>((set) => ({
  socket: null,
  state: null,
  setSocket: (socket) => set({ socket }),
  setState: (state) => set({ state }),
}));

export default function App() {
  const { socket, setSocket, state, setState } = useStore();

  useEffect(() => {
    const s = io();
    s.on('state', setState);
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, [setSocket, setState]);

  const createMatch = async () => {
    const res = await fetch('/api/matches', { method: 'POST' });
    const json = await res.json();
    socket?.emit('joinMatch', json.id);
  };

  return (
    <div>
      <button onClick={createMatch}>Create Match</button>
      <pre>{JSON.stringify(state, null, 2)}</pre>
      <Board />
    </div>
  );
}
