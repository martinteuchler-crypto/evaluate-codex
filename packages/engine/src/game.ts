import { createBoard } from './board';
import { BoardGraph, Color, GameState, Move, Piece } from './types';

export function createInitialPosition(): GameState {
  const board: BoardGraph = createBoard();
  const pieces: Record<string, Piece | null> = {};
  Object.keys(board).forEach((sq) => (pieces[sq] = null));
  pieces['4,0'] = { color: 'white', type: 'K' };
  pieces['7,7'] = { color: 'black', type: 'K' };
  pieces['0,4'] = { color: 'gold', type: 'K' };
  return { board, pieces, turn: ['white', 'black', 'gold'], activeColor: 'white' };
}

export function generateLegalMoves(state: GameState, color: Color): Move[] {
  const moves: Move[] = [];
  for (const [sq, piece] of Object.entries(state.pieces)) {
    if (!piece || piece.color !== color) continue;
    const adj = state.board[sq];
    for (const dir of ['north', 'south', 'east', 'west'] as const) {
      const to = adj[dir];
      if (to && !state.pieces[to]) {
        moves.push({ from: sq, to });
      }
    }
  }
  return moves;
}

export function applyMove(state: GameState, move: Move): GameState {
  const nextPieces = { ...state.pieces };
  nextPieces[move.to] = nextPieces[move.from];
  nextPieces[move.from] = null;
  const turn = state.turn;
  const idx = turn.indexOf(state.activeColor);
  const nextIdx = (idx + 1) % turn.length;
  return { ...state, pieces: nextPieces, activeColor: turn[nextIdx] };
}

export function isCheck(): boolean {
  return false; // TODO implement
}

export function isCheckmate(): boolean {
  return false; // TODO implement
}

export function serialize(state: GameState): string {
  return JSON.stringify(state);
}

export function deserialize(payload: string): GameState {
  return JSON.parse(payload) as GameState;
}
