import { createInitialPosition, generateLegalMoves } from '../src';

describe('engine', () => {
  it('creates initial position', () => {
    const state = createInitialPosition();
    const pieceCount = Object.values(state.pieces).filter(Boolean).length;
    expect(pieceCount).toBe(3);
    expect(state.activeColor).toBe('white');
  });

  it('generates moves for active color', () => {
    const state = createInitialPosition();
    const moves = generateLegalMoves(state, state.activeColor);
    expect(Array.isArray(moves)).toBe(true);
  });
});
