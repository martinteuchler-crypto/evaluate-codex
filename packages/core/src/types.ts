import { z } from 'zod';

export const playerSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  handedness: z.enum(['R', 'L']).optional(),
  ratingElo: z.number().default(1000),
  notes: z.string().optional(),
  createdAt: z.date()
});
export type Player = z.infer<typeof playerSchema>;

export const teamSchema = z.object({
  id: z.string(),
  name: z.string(),
  playerIds: z.array(z.string()),
  isDoubles: z.boolean(),
  createdAt: z.date()
});
export type Team = z.infer<typeof teamSchema>;

export const matchSchema = z.object({
  id: z.string(),
  mode: z.enum(['singles', 'doubles']),
  participants: z.object({
    home: z.object({ playerIds: z.array(z.string()) }),
    away: z.object({ playerIds: z.array(z.string()) })
  }),
  context: z.object({
    tournamentId: z.string().optional(),
    leagueSeasonId: z.string().optional(),
    round: z.number().optional(),
    bracketSlot: z.string().optional()
  }),
  bestOf: z.union([z.literal(3), z.literal(5), z.literal(7)]),
  scoreByGame: z.array(z.object({ home: z.number(), away: z.number() })).optional(),
  result: z
    .object({
      winner: z.enum(['home', 'away']),
      method: z.enum(['PLAY', 'WO', 'RET'])
    })
    .optional(),
  startedAt: z.date().optional(),
  finishedAt: z.date().optional()
});
export type Match = z.infer<typeof matchSchema>;

export interface BracketNode {
  id: string;
  round: number;
  slot: number | string;
  upstreamA?: string;
  upstreamB?: string;
  downstream?: string;
  completed: boolean;
  matchId?: string;
}

export interface BracketState {
  nodes: BracketNode[];
}

export const tournamentSchema = z.object({
  id: z.string(),
  name: z.string(),
  bracketType: z.enum(['single', 'double']),
  seededParticipantIds: z.array(z.string()),
  settings: z.object({
    thirdPlace: z.boolean(),
    bestOf: z.union([z.literal(3), z.literal(5), z.literal(7)])
  }),
  bracket: z.any()
});
export type Tournament = z.infer<typeof tournamentSchema>;

export const leagueSeasonSchema = z.object({
  id: z.string(),
  name: z.string(),
  participants: z.array(
    z.object({ id: z.string(), type: z.enum(['player', 'team']) })
  ),
  doubleRoundRobin: z.boolean(),
  fixtureList: z.array(z.any()),
  standings: z.array(z.any()),
  settings: z.object({
    pointsForWin: z.number(),
    pointsForLoss: z.number(),
    pointsForWO: z.number(),
    bestOf: z.union([z.literal(3), z.literal(5), z.literal(7)]),
    tiebreakers: z.array(z.string())
  })
});
export type LeagueSeason = z.infer<typeof leagueSeasonSchema>;
