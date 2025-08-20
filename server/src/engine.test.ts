import assert from 'assert';
import { createInitial, applyMove, isCheck, GameState } from './engine.ts';

// check detection
const state1: GameState = {
  turn: 'white',
  pieces: {
    's0_0': { type: 'rook', color: 'white' },
    's6_0': { type: 'king', color: 'black' },
    's4_4': { type: 'king', color: 'gold' }
  },
  eliminated: { white: false, black: false, gold: false }
};
applyMove(state1, { from: 's0_0', to: 's5_0' });
assert.ok(isCheck(state1, 'black'), 'black should be in check');

// pawn promotion
const state2: GameState = {
  turn: 'white',
  pieces: {
    's6_0': { type: 'pawn', color: 'white' },
    's7_0': { type: 'king', color: 'white' },
    's0_0': { type: 'king', color: 'black' },
    's4_0': { type: 'king', color: 'gold' }
  },
  eliminated: { white: false, black: false, gold: false }
};
applyMove(state2, { from: 's6_0', to: 's7_0' });
assert.equal(state2.pieces['s7_0'].type, 'queen', 'pawn should promote to queen');

// elimination
const state3 = createInitial();
applyMove(state3, { from: 's0_0', to: 's7_4' });
assert.equal(state3.eliminated.black, true, 'black eliminated when king captured');

console.log('engine tests passed');
