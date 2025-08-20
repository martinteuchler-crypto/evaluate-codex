import { describe, expect, it } from 'vitest';
import { generateBracket } from '../src/bracket';

describe('generateBracket', () => {
  it('creates a bracket for 4 participants', () => {
    const bracket = generateBracket(['A', 'B', 'C', 'D'], 'single');
    // semifinals + final
    expect(bracket.nodes.length).toBe(3);
    const final = bracket.nodes.find(n => n.round === 2);
    expect(final).toBeDefined();
  });
});
