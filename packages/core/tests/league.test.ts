import { describe, expect, it } from 'vitest';
import { recomputeStandings } from '../src/league';
import type { Match } from '../src/types';

describe('recomputeStandings', () => {
  it('sorts by points then game diff', () => {
    const matches: Match[] = [
      {
        id: 'm1',
        mode: 'singles',
        participants: { home: { playerIds: ['A'] }, away: { playerIds: ['B'] } },
        context: {},
        bestOf: 3,
        scoreByGame: [ {home:11, away:9}, {home:11, away:8} ],
        result: { winner: 'home', method: 'PLAY' }
      },
      {
        id: 'm2',
        mode: 'singles',
        participants: { home: { playerIds: ['C'] }, away: { playerIds: ['A'] } },
        context: {},
        bestOf: 3,
        scoreByGame: [ {home:11, away:9}, {home:11, away:8} ],
        result: { winner: 'home', method: 'PLAY' }
      }
    ];
    const table = recomputeStandings(matches, ['A','B','C'], {
      pointsForWin: 2,
      pointsForLoss: 0,
      pointsForWO: 0
    });
    expect(table[0].id).toBe('C');
    expect(table[0].points).toBe(2);
  });
});
