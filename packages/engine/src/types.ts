export type Color = 'white' | 'black' | 'gold';

export type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P';

export interface Piece {
  color: Color;
  type: PieceType;
}

export type SquareID = string;

export interface Move {
  from: SquareID;
  to: SquareID;
  promotion?: PieceType;
  meta?: Record<string, unknown>;
}

export interface BoardGraph {
  [square: SquareID]: {
    // Adjacent squares in four orthogonal directions
    north?: SquareID;
    south?: SquareID;
    east?: SquareID;
    west?: SquareID;
  };
}

export interface GameState {
  board: BoardGraph;
  pieces: Record<SquareID, Piece | null>;
  turn: Color[]; // order of remaining players
  activeColor: Color;
}
