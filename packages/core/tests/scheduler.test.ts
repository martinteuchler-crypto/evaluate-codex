import { describe, expect, it } from 'vitest';
import { scheduleRoundRobin } from '../src/scheduler';

describe('scheduleRoundRobin', () => {
  it('generates correct number of fixtures for 4 players single round', () => {
    const fixtures = scheduleRoundRobin(['A', 'B', 'C', 'D']);
    expect(fixtures.length).toBe(6); // 4 choose 2
    const rounds = Math.max(...fixtures.map(f => f.round));
    expect(rounds).toBe(3);
  });

  it('generates double round fixtures', () => {
    const fixtures = scheduleRoundRobin(['A', 'B', 'C', 'D'], { doubleRound: true });
    expect(fixtures.length).toBe(12);
    const rounds = Math.max(...fixtures.map(f => f.round));
    expect(rounds).toBe(6);
  });
});
