import { DEFAULT_K_FACTOR } from './constants';

/**
 * Update two Elo ratings based on the outcome of a match.
 * @param ratingA current rating of player/team A
 * @param ratingB current rating of player/team B
 * @param outcome 1 if A wins, 0 if B wins
 * @param K optional K-factor (default 20)
 * @returns tuple of new ratings [ratingA, ratingB]
 */
export function updateElo(
  ratingA: number,
  ratingB: number,
  outcome: 1 | 0,
  K: number = DEFAULT_K_FACTOR
): [number, number] {
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  const expectedB = 1 / (1 + Math.pow(10, (ratingA - ratingB) / 400));
  const newA = ratingA + K * (outcome - expectedA);
  const newB = ratingB + K * ((1 - outcome) - expectedB);
  return [newA, newB];
}
