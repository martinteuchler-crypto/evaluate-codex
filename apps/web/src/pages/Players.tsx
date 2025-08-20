import React, { useState } from 'react';
import { useStore } from '../store';

const Players: React.FC = () => {
  const { players, addPlayer, updatePlayer, deletePlayer } = useStore();
  const [name, setName] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await addPlayer(name.trim());
    setName('');
  };

  const startEdit = (id: string, current: string) => {
    setEditing(id);
    setEditName(current);
  };

  const onEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await updatePlayer(editing, editName);
      setEditing(null);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Players</h2>
      <form onSubmit={onAdd} className="flex space-x-2">
        <input className="border p-1 flex-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Player name" />
        <button type="submit" className="bg-blue-500 text-white px-2">Add</button>
      </form>
      <ul className="space-y-2">
        {players.map((p) => (
          <li key={p.id} className="flex items-center space-x-2">
            {editing === p.id ? (
              <form onSubmit={onEdit} className="flex space-x-2 flex-1">
                <input className="border p-1 flex-1" value={editName} onChange={(e) => setEditName(e.target.value)} />
                <button type="submit" className="bg-green-500 text-white px-2">Save</button>
                <button type="button" onClick={() => setEditing(null)} className="px-2">Cancel</button>
              </form>
            ) : (
              <>
                <span className="flex-1">{p.name} (Elo {p.ratingElo})</span>
                <button onClick={() => startEdit(p.id, p.name)} className="px-2 text-blue-600">Edit</button>
                <button onClick={() => deletePlayer(p.id)} className="px-2 text-red-600">Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Players;
