import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { db } from './db';
import type { Player, Team, Tournament, BracketNode, Match } from './types';
import { updateElo } from '@core/elo';
import { generateBracket } from '@core/bracket';

interface Store {
  players: Player[];
  teams: Team[];
  tournaments: Tournament[];
  matches: Match[];
  load: () => Promise<void>;
  addPlayer: (name: string) => Promise<void>;
  updatePlayer: (id: string, name: string) => Promise<void>;
  deletePlayer: (id: string) => Promise<void>;
  addTeam: (name: string, playerIds: string[]) => Promise<void>;
  updateTeam: (id: string, playerIds: string[]) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  createTournament: (name: string, participantIds: string[]) => Promise<void>;
  recordTournamentMatch: (tournamentId: string, nodeId: string, winner: 'home' | 'away') => Promise<void>;
  recordMatch: (homeId: string, awayId: string, winner: 'home' | 'away') => Promise<void>;
}

export const useStore = create<Store>((set, get) => ({
  players: [],
  teams: [],
  tournaments: [],
  matches: [],
  load: async () => {
    const [players, teams, tournaments, matches] = await Promise.all([
      db.players.toArray(),
      db.teams.toArray(),
      db.tournaments.toArray(),
      db.matches.toArray()
    ]);
    set({ players, teams, tournaments, matches });
  },
  addPlayer: async (name) => {
    const player: Player = { id: nanoid(), name, ratingElo: 1000, createdAt: new Date() };
    await db.players.add(player);
    set((s) => ({ players: [...s.players, player] }));
  },
  updatePlayer: async (id, name) => {
    await db.players.update(id, { name });
    set((s) => ({ players: s.players.map((p) => (p.id === id ? { ...p, name } : p)) }));
  },
  deletePlayer: async (id) => {
    await db.players.delete(id);
    set((s) => ({ players: s.players.filter((p) => p.id !== id) }));
  },
  addTeam: async (name, playerIds) => {
    const team: Team = { id: nanoid(), name, playerIds, isDoubles: playerIds.length === 2, createdAt: new Date() };
    await db.teams.add(team);
    set((s) => ({ teams: [...s.teams, team] }));
  },
  updateTeam: async (id, playerIds) => {
    await db.teams.update(id, { playerIds, isDoubles: playerIds.length === 2 });
    set((s) => ({ teams: s.teams.map((t) => (t.id === id ? { ...t, playerIds, isDoubles: playerIds.length === 2 } : t)) }));
  },
  deleteTeam: async (id) => {
    await db.teams.delete(id);
    set((s) => ({ teams: s.teams.filter((t) => t.id !== id) }));
  },
  createTournament: async (name, participantIds) => {
    const bracket = generateBracket(participantIds, 'single');
    // assign participants to first round nodes
    const nodes: BracketNode[] = bracket.nodes.map((n) => ({ ...n }));
    const firstRound = nodes.filter((n) => n.round === 1);
    for (let i = 0; i < firstRound.length; i++) {
      firstRound[i].homeId = participantIds[i * 2];
      firstRound[i].awayId = participantIds[i * 2 + 1];
    }
    const tournament: Tournament = { id: nanoid(), name, bracket: nodes, createdAt: new Date() };
    await db.tournaments.add(tournament);
    set((s) => ({ tournaments: [...s.tournaments, tournament] }));
  },
  recordTournamentMatch: async (tournamentId, nodeId, winner) => {
    const { tournaments } = get();
    const tournament = tournaments.find((t) => t.id === tournamentId);
    if (!tournament) return;
    const node = tournament.bracket.find((n) => n.id === nodeId);
    if (!node || !node.homeId || !node.awayId) return;
    const homeId = node.homeId;
    const awayId = node.awayId;
    await get().recordMatch(homeId, awayId, winner).then((matchId) => {
      node.matchId = matchId;
      node.winnerId = winner === 'home' ? homeId : awayId;
      node.completed = true;
      if (node.downstream) {
        const downstream = tournament.bracket.find((n) => n.id === node.downstream);
        if (downstream) {
          if (downstream.upstreamA === node.id) downstream.homeId = node.winnerId;
          if (downstream.upstreamB === node.id) downstream.awayId = node.winnerId;
        }
      }
    });
    await db.tournaments.put(tournament);
    set((s) => ({ tournaments: s.tournaments.map((t) => (t.id === tournament.id ? tournament : t)) }));
  },
  recordMatch: async (homeId, awayId, winner) => {
    const outcome: 1 | 0 = winner === 'home' ? 1 : 0;
    const state = get();
    const home = state.players.find((p) => p.id === homeId);
    const away = state.players.find((p) => p.id === awayId);
    if (!home || !away) return '';
    const [newHome, newAway] = updateElo(home.ratingElo, away.ratingElo, outcome);
    home.ratingElo = Math.round(newHome);
    away.ratingElo = Math.round(newAway);
    await db.players.put(home);
    await db.players.put(away);
    const match: Match = {
      id: nanoid(),
      mode: 'singles',
      participants: { home: { playerIds: [homeId] }, away: { playerIds: [awayId] } },
      result: { winner, method: 'PLAY' },
      bestOf: 3,
      startedAt: new Date(),
      finishedAt: new Date()
    };
    await db.matches.add(match);
    set((s) => ({
      players: s.players.map((p) =>
        p.id === home.id ? home : p.id === away.id ? away : p
      ),
      matches: [...s.matches, match]
    }));
    return match.id;
  }
}));
