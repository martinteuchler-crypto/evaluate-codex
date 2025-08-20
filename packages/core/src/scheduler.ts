export interface Fixture {
  round: number;
  home: string;
  away: string;
}

/**
 * Generate a round-robin schedule using the circle method.
 * Returns an array of fixtures with round numbers.
 */
export function scheduleRoundRobin(
  participants: string[],
  opts: { doubleRound?: boolean } = {}
): Fixture[] {
  const players = [...participants];
  const isOdd = players.length % 2 === 1;
  if (isOdd) players.push('BYE');
  const n = players.length;
  const rounds = n - 1;
  const fixtures: Fixture[] = [];
  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < n / 2; i++) {
      const home = players[i];
      const away = players[n - 1 - i];
      if (home !== 'BYE' && away !== 'BYE') {
        fixtures.push({ round: r + 1, home, away });
      }
    }
    // rotate array except first element
    const fixed = players.shift()!; // first element
    const moved = players.pop()!;
    players.unshift(fixed);
    players.splice(1, 0, moved);
  }
  if (opts.doubleRound) {
    const secondLeg = fixtures.map(f => ({
      round: f.round + rounds,
      home: f.away,
      away: f.home
    }));
    fixtures.push(...secondLeg);
  }
  return fixtures;
}
