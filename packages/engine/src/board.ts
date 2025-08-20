import { BoardGraph } from './types';

/**
 * Simple rectangular board used as placeholder.
 * The real game uses a specialised 96-square board composed of three
 * trapezoids around a central zone. For brevity this demo uses a 12x8 grid
 * (96 squares) which matches the square count and keeps the engine logic
 * decoupled from rendering specifics.
 */
export function createBoard(): BoardGraph {
  const board: BoardGraph = {};
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 12; x++) {
      const id = `${x},${y}`;
      board[id] = {};
      if (y > 0) board[id].north = `${x},${y - 1}`;
      if (y < 7) board[id].south = `${x},${y + 1}`;
      if (x > 0) board[id].west = `${x - 1},${y}`;
      if (x < 11) board[id].east = `${x + 1},${y}`;
    }
  }
  return board;
}
