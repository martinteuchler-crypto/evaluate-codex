import { useState } from 'react';

export default function Lobby({ onJoin }: { onJoin: (token: string) => void }) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [color, setColor] = useState('white');

  async function create() {
    const res = await fetch('/api/create', { method: 'POST' });
    const data = await res.json();
    setCode(data.code);
  }

  async function join() {
    const res = await fetch('/api/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, name, color }),
    });
    const data = await res.json();
    if (data.token) onJoin(data.token);
  }

  return (
    <div style={{ padding: 16 }}>
      <button onClick={create}>Create Game</button>
      <div>
        <input value={code} onChange={e => setCode(e.target.value)} placeholder="code" />
        <input value={name} onChange={e => setName(e.target.value)} placeholder="name" />
        <select value={color} onChange={e => setColor(e.target.value)}>
          <option value="white">White</option>
          <option value="black">Black</option>
          <option value="gold">Gold</option>
        </select>
        <button onClick={join}>Join</button>
      </div>
    </div>
  );
}
