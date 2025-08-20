export interface Player {
  id: string;
  name: string;
  ratingElo: number;
  createdAt: Date;
}

export interface Team {
  id: string;
  name: string;
  playerIds: string[];
  isDoubles: boolean;
  createdAt: Date;
}

export interface Match {
  id: string;
  mode: 'singles' | 'doubles';
  participants: {
    home: { playerIds: string[] };
    away: { playerIds: string[] };
  };
  result: {
    winner: 'home' | 'away';
    method: 'PLAY' | 'WO' | 'RET';
  };
  bestOf: 3 | 5 | 7;
  startedAt: Date;
  finishedAt: Date;
}

export interface BracketNode {
  id: string;
  round: number;
  slot: number | string;
  upstreamA?: string;
  upstreamB?: string;
  downstream?: string;
  homeId?: string;
  awayId?: string;
  winnerId?: string;
  matchId?: string;
  completed: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  bracket: BracketNode[];
  createdAt: Date;
}

