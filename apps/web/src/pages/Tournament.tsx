import React from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../store';

const TournamentView: React.FC = () => {
  const { id } = useParams();
  const { tournaments, players, teams, recordTournamentMatch } = useStore();
  const tournament = tournaments.find((t) => t.id === id);
  if (!tournament) return <div className="p-4">Tournament not found</div>;

  const getName = (pid?: string) => {
    if (!pid) return '';
    return tournament.mode === 'singles'
      ? players.find((p) => p.id === pid)?.name || ''
      : teams.find((t) => t.id === pid)?.name || '';
  };
  const pending = tournament.bracket.find((n) => n.homeId && n.awayId && !n.completed);
  const championNode = tournament.bracket.find((n) => !n.downstream);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">{tournament.name}</h2>
      {pending ? (
        <div className="space-y-2">
          <p>
            {getName(pending.homeId)} vs {getName(pending.awayId)}
          </p>
          <div className="space-x-2">
            <button
              className="bg-green-500 text-white px-2"
              onClick={() => recordTournamentMatch(tournament.id, pending.id, 'home')}
            >
              Home wins
            </button>
            <button
              className="bg-blue-500 text-white px-2"
              onClick={() => recordTournamentMatch(tournament.id, pending.id, 'away')}
            >
              Away wins
            </button>
          </div>
        </div>
      ) : (
        <p>Winner: {getName(championNode?.winnerId)}</p>
      )}
      <div>
        <h3 className="font-semibold">Bracket</h3>
        <ul className="space-y-1">
          {tournament.bracket.map((n) => (
            <li key={n.id}>
              {n.id}: {getName(n.homeId)} vs {getName(n.awayId)} {n.winnerId ? `→ ${getName(n.winnerId)}` : ''}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TournamentView;
