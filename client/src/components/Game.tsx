import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Board3D from './Board3D';
import HUD from './HUD';

export default function Game({ token }: { token: string }) {
  const [state, setState] = useState<any>();
  useEffect(() => {
    const socket = io();
    socket.emit('join', { token });
    socket.on('state', setState);
    return () => { socket.disconnect(); };
  }, [token]);

  if (!state) return <div>Loading...</div>;
  return (
    <div>
      <Board3D state={state} />
      <HUD state={state} />
    </div>
  );
}
