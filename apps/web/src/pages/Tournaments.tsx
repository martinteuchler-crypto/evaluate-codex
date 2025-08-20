import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';

const Tournaments: React.FC = () => {
  const { players, tournaments, createTournament } = useStore();
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((s) => (s.includes(id) ? s.filter((p) => p !== id) : [...s, id]));
  };

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || selected.length < 2) return;
    await createTournament(name.trim(), selected);
    setName('');
    setSelected([]);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Tournaments</h2>
      <form onSubmit={onAdd} className="space-y-2">
        <input className="border p-1 w-full" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tournament name" />
        <div className="flex flex-wrap gap-2">
          {players.map((p) => (
            <label key={p.id} className="flex items-center space-x-1">
              <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggle(p.id)} />
              <span>{p.name}</span>
            </label>
          ))}
        </div>
        <button type="submit" className="bg-blue-500 text-white px-2">Create</button>
      </form>
      <ul className="space-y-2">
        {tournaments.map((t) => (
          <li key={t.id}>
            <Link to={`/tournaments/${t.id}`} className="text-blue-600 underline">{t.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tournaments;
