import type { Match } from './types';

export interface StandingRow {
  id: string;
  played: number;
  wins: number;
  losses: number;
  points: number;
  gameDiff: number;
  pointsDiff: number;
}

interface Rules {
  pointsForWin: number;
  pointsForLoss: number;
  pointsForWO: number;
}

/**
 * Compute league standings from finished matches.
 */
export function recomputeStandings(
  matches: Match[],
  participantIds: string[],
  rules: Rules
): StandingRow[] {
  const table: Record<string, StandingRow> = {};
  for (const id of participantIds) {
    table[id] = {
      id,
      played: 0,
      wins: 0,
      losses: 0,
      points: 0,
      gameDiff: 0,
      pointsDiff: 0
    };
  }
  for (const m of matches) {
    if (!m.result) continue;
    const home = table[m.participants.home.playerIds[0]];
    const away = table[m.participants.away.playerIds[0]];
    if (!home || !away) continue;
    home.played++;
    away.played++;
    const homeGames = m.scoreByGame?.reduce((s, g) => s + (g.home > g.away ? 1 : 0), 0) || 0;
    const awayGames = m.scoreByGame?.reduce((s, g) => s + (g.away > g.home ? 1 : 0), 0) || 0;
    home.gameDiff += homeGames - awayGames;
    away.gameDiff += awayGames - homeGames;
    const homePts = m.scoreByGame?.reduce((s, g) => s + g.home - g.away, 0) || 0;
    const awayPts = -homePts;
    home.pointsDiff += homePts;
    away.pointsDiff += awayPts;
    if (m.result.winner === 'home') {
      home.wins++;
      away.losses++;
      home.points += rules.pointsForWin;
      away.points += rules.pointsForLoss;
    } else {
      away.wins++;
      home.losses++;
      away.points += rules.pointsForWin;
      home.points += rules.pointsForLoss;
    }
  }
  return Object.values(table).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gameDiff !== a.gameDiff) return b.gameDiff - a.gameDiff;
    return b.pointsDiff - a.pointsDiff;
  });
}
