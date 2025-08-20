import React, { useState } from 'react';
import { useStore } from '../store';

const Teams: React.FC = () => {
  const { teams, players, addTeam, updateTeam, deleteTeam } = useStore();
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editSelected, setEditSelected] = useState<string[]>([]);

  const toggle = (id: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(id) ? list.filter((p) => p !== id) : [...list, id]);
  };

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await addTeam(name.trim(), selected);
    setName('');
    setSelected([]);
  };

  const startEdit = (teamId: string, members: string[]) => {
    setEditing(teamId);
    setEditSelected(members);
  };

  const onEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await updateTeam(editing, editSelected);
      setEditing(null);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Teams</h2>
      <form onSubmit={onAdd} className="space-y-2">
        <input className="border p-1 w-full" value={name} onChange={(e) => setName(e.target.value)} placeholder="Team name" />
        <div className="flex flex-wrap gap-2">
          {players.map((p) => (
            <label key={p.id} className="flex items-center space-x-1">
              <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggle(p.id, selected, setSelected)} />
              <span>{p.name}</span>
            </label>
          ))}
        </div>
        <button type="submit" className="bg-blue-500 text-white px-2">Create</button>
      </form>
      <ul className="space-y-2">
        {teams.map((t) => (
          <li key={t.id} className="border p-2">
            {editing === t.id ? (
              <form onSubmit={onEdit} className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {players.map((p) => (
                    <label key={p.id} className="flex items-center space-x-1">
                      <input type="checkbox" checked={editSelected.includes(p.id)} onChange={() => toggle(p.id, editSelected, setEditSelected)} />
                      <span>{p.name}</span>
                    </label>
                  ))}
                </div>
                <button type="submit" className="bg-green-500 text-white px-2">Save</button>
                <button type="button" onClick={() => setEditing(null)} className="px-2">Cancel</button>
              </form>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{t.name}</span>
                  <div className="space-x-2">
                    <button onClick={() => startEdit(t.id, t.playerIds)} className="text-blue-600">Edit</button>
                    <button onClick={() => deleteTeam(t.id)} className="text-red-600">Delete</button>
                  </div>
                </div>
                <ul className="pl-4 list-disc">
                  {t.playerIds.map((pid) => {
                    const p = players.find((pl) => pl.id === pid);
                    return <li key={pid}>{p ? p.name : pid}</li>;
                  })}
                </ul>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Teams;
