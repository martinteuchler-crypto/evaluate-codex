import type { BracketNode, BracketState } from './types';

function nextPowerOfTwo(n: number) {
  return 1 << Math.ceil(Math.log2(n));
}

/**
 * Generate a simple single-elimination bracket.
 */
export function generateBracket(
  participantIds: string[],
  type: 'single' | 'double',
  opts: { thirdPlace?: boolean } = {}
): BracketState {
  // only single elimination implemented
  const total = nextPowerOfTwo(participantIds.length);
  const rounds = Math.log2(total);
  const nodes: BracketNode[] = [];
  let previousRoundIds: string[] = [];
  for (let r = 1; r <= rounds; r++) {
    const matches = total / Math.pow(2, r);
    const currentRoundIds: string[] = [];
    for (let m = 0; m < matches; m++) {
      const id = `R${r}M${m + 1}`;
      const upstreamA = r === 1 ? undefined : previousRoundIds[m * 2];
      const upstreamB = r === 1 ? undefined : previousRoundIds[m * 2 + 1];
      const downstream = r === rounds ? undefined : `R${r + 1}M${Math.floor(m / 2) + 1}`;
      nodes.push({ id, round: r, slot: m + 1, upstreamA, upstreamB, downstream, completed: false });
      currentRoundIds.push(id);
    }
    previousRoundIds = currentRoundIds;
  }
  if (opts.thirdPlace && previousRoundIds.length === 1) {
    // semifinals are nodes where round == rounds-1
    const semis = nodes.filter(n => n.round === rounds - 1);
    if (semis.length === 2) {
      nodes.push({
        id: 'T3',
        round: rounds,
        slot: 'third',
        upstreamA: semis[0].id,
        upstreamB: semis[1].id,
        completed: false
      });
    }
  }
  return { nodes };
}
