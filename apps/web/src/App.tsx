import React, { useEffect, useState } from 'react';
import { useStore } from './store';

const App: React.FC = () => {
  const { players, load, addPlayer } = useStore();
  const [name, setName] = useState('');

  useEffect(() => {
    load();
  }, [load]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await addPlayer(name.trim());
    setName('');
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Table Tennis Tracker</h1>
      <form onSubmit={onSubmit} className="flex space-x-2">
        <input
          className="border p-1 flex-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Player name"
        />
        <button type="submit" className="bg-blue-500 text-white px-2">
          Add
        </button>
      </form>
      <ul className="list-disc pl-4">
        {players.map((p) => (
          <li key={p.id}>
            {p.name} (Elo {p.ratingElo})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
