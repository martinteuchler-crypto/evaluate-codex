import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useStore } from './store';
import Players from './pages/Players';
import Teams from './pages/Teams';
import Tournaments from './pages/Tournaments';
import TournamentView from './pages/Tournament';
import Matches from './pages/Matches';

const App: React.FC = () => {
  const load = useStore((s) => s.load);
  useEffect(() => {
    load();
  }, [load]);
  return (
    <BrowserRouter>
      <nav className="p-2 space-x-4 bg-gray-100">
        <Link to="/players">Players</Link>
        <Link to="/teams">Teams</Link>
        <Link to="/tournaments">Tournaments</Link>
        <Link to="/matches">Enter Match</Link>
      </nav>
      <Routes>
        <Route path="/players" element={<Players />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/tournaments/:id" element={<TournamentView />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/" element={<Players />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
