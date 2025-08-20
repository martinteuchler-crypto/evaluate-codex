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
  createTournament: (name: string, participantIds: string[], mode: 'singles' | 'doubles') => Promise<void>;
  recordTournamentMatch: (tournamentId: string, nodeId: string, winner: 'home' | 'away') => Promise<void>;
  recordMatch: (homeIds: string[], awayIds: string[], winner: 'home' | 'away', mode: 'singles' | 'doubles') => Promise<string>;
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
    if (playerIds.length !== 2) throw new Error('Team must have exactly two players');
    const team: Team = { id: nanoid(), name, playerIds, isDoubles: true, createdAt: new Date() };
    await db.teams.add(team);
    set((s) => ({ teams: [...s.teams, team] }));
  },
  updateTeam: async (id, playerIds) => {
    if (playerIds.length !== 2) throw new Error('Team must have exactly two players');
    await db.teams.update(id, { playerIds, isDoubles: true });
    set((s) => ({ teams: s.teams.map((t) => (t.id === id ? { ...t, playerIds, isDoubles: true } : t)) }));
  },
  deleteTeam: async (id) => {
    await db.teams.delete(id);
    set((s) => ({ teams: s.teams.filter((t) => t.id !== id) }));
  },
  createTournament: async (name, participantIds, mode) => {
    const bracket = generateBracket(participantIds, 'single');
    // assign participants to first round nodes
    const nodes: BracketNode[] = bracket.nodes.map((n) => ({ ...n }));
    const firstRound = nodes.filter((n) => n.round === 1);
    for (let i = 0; i < firstRound.length; i++) {
      firstRound[i].homeId = participantIds[i * 2];
      firstRound[i].awayId = participantIds[i * 2 + 1];
    }
    const tournament: Tournament = { id: nanoid(), name, mode, bracket: nodes, createdAt: new Date() };
    await db.tournaments.add(tournament);
    set((s) => ({ tournaments: [...s.tournaments, tournament] }));
  },
  recordTournamentMatch: async (tournamentId, nodeId, winner) => {
    const { tournaments, teams } = get();
    const tournament = tournaments.find((t) => t.id === tournamentId);
    if (!tournament) return;
    const node = tournament.bracket.find((n) => n.id === nodeId);
    if (!node || !node.homeId || !node.awayId) return;
    const homeIds = tournament.mode === 'singles' ? [node.homeId] : teams.find((t) => t.id === node.homeId)?.playerIds || [];
    const awayIds = tournament.mode === 'singles' ? [node.awayId] : teams.find((t) => t.id === node.awayId)?.playerIds || [];
    if (homeIds.length === 0 || awayIds.length === 0) return;
    await get().recordMatch(homeIds, awayIds, winner, tournament.mode).then((matchId) => {
      node.matchId = matchId;
      node.winnerId = winner === 'home' ? node.homeId : node.awayId;
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
  recordMatch: async (homeIds, awayIds, winner, mode) => {
    const outcome: 1 | 0 = winner === 'home' ? 1 : 0;
    const state = get();
    const homePlayers = homeIds.map((id) => state.players.find((p) => p.id === id)).filter((p): p is Player => Boolean(p));
    const awayPlayers = awayIds.map((id) => state.players.find((p) => p.id === id)).filter((p): p is Player => Boolean(p));
    if (homePlayers.length !== homeIds.length || awayPlayers.length !== awayIds.length) return '';
    const homeAvg = homePlayers.reduce((s, p) => s + p.ratingElo, 0) / homePlayers.length;
    const awayAvg = awayPlayers.reduce((s, p) => s + p.ratingElo, 0) / awayPlayers.length;
    const [newHomeAvg, newAwayAvg] = updateElo(homeAvg, awayAvg, outcome);
    const deltaHome = newHomeAvg - homeAvg;
    const deltaAway = newAwayAvg - awayAvg;
    for (const p of homePlayers) {
      p.ratingElo = Math.round(p.ratingElo + deltaHome);
      await db.players.put(p);
    }
    for (const p of awayPlayers) {
      p.ratingElo = Math.round(p.ratingElo + deltaAway);
      await db.players.put(p);
    }
    const match: Match = {
      id: nanoid(),
      mode,
      participants: { home: { playerIds: homeIds }, away: { playerIds: awayIds } },
      result: { winner, method: 'PLAY' },
      bestOf: 3,
      startedAt: new Date(),
      finishedAt: new Date()
    };
    await db.matches.add(match);
    set((s) => ({
      players: s.players.map((p) => {
        const updated = [...homePlayers, ...awayPlayers].find((u) => u.id === p.id);
        return updated ? updated : p;
      }),
      matches: [...s.matches, match]
    }));
    return match.id;
  }
}));
