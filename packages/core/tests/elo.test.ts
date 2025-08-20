import { describe, expect, it } from 'vitest';
import { updateElo } from '../src/elo';

describe('updateElo', () => {
  it('moves ratings toward each other based on result', () => {
    const [ra, rb] = updateElo(1000, 1000, 1);
    expect(ra).toBeGreaterThan(1000);
    expect(rb).toBeLessThan(1000);
  });
});
