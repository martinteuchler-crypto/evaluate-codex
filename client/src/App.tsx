import { useState } from 'react';
import Lobby from './components/Lobby';
import Game from './components/Game';

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  return token ? <Game token={token} /> : <Lobby onJoin={setToken} />;
}
