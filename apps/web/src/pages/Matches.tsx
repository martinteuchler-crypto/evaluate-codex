import React, { useState } from 'react';
import { useStore } from '../store';

const Matches: React.FC = () => {
  const { players, recordMatch } = useStore();
  const [home, setHome] = useState('');
  const [away, setAway] = useState('');
  const [winner, setWinner] = useState<'home' | 'away'>('home');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!home || !away || home === away) return;
    await recordMatch([home], [away], winner, 'singles');
    setHome('');
    setAway('');
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Enter Match Result</h2>
      <form onSubmit={onSubmit} className="space-y-2">
        <select className="border p-1 w-full" value={home} onChange={(e) => setHome(e.target.value)}>
          <option value="">Home player</option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select className="border p-1 w-full" value={away} onChange={(e) => setAway(e.target.value)}>
          <option value="">Away player</option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <div className="space-x-2">
          <label className="mr-2">
            <input type="radio" value="home" checked={winner === 'home'} onChange={() => setWinner('home')} /> Home wins
          </label>
          <label>
            <input type="radio" value="away" checked={winner === 'away'} onChange={() => setWinner('away')} /> Away wins
          </label>
        </div>
        <button type="submit" className="bg-blue-500 text-white px-2">Record</button>
      </form>
    </div>
  );
};

export default Matches;
