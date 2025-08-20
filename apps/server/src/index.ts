import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { z } from 'zod';
import {
  createInitialPosition,
  generateLegalMoves,
  applyMove,
  GameState,
} from '@three-chess/engine';

interface Match {
  id: string;
  state: GameState;
}

export function createApp() {
  const matches = new Map<string, Match>();
  const app = express();
  app.use(express.json());
  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer, { cors: { origin: '*' } });

  app.post('/api/matches', (_req, res) => {
    const id = Math.random().toString(36).slice(2, 8);
    const match: Match = { id, state: createInitialPosition() };
    matches.set(id, match);
    res.json({ id });
  });

  app.get('/api/matches/:id', (req, res) => {
    const match = matches.get(req.params.id);
    if (!match) return res.status(404).send('not found');
    res.json(match.state);
  });

  io.on('connection', (socket) => {
    socket.on('joinMatch', (id: string) => {
      socket.join(id);
      const match = matches.get(id);
      if (match) socket.emit('state', match.state);
    });

    socket.on('submitMove', (payload) => {
      const schema = z.object({ matchId: z.string(), from: z.string(), to: z.string() });
      const parsed = schema.safeParse(payload);
      if (!parsed.success) return;
      const { matchId, from, to } = parsed.data;
      const match = matches.get(matchId);
      if (!match) return;
      const legal = generateLegalMoves(match.state, match.state.activeColor);
      const move = legal.find((m: any) => m.from === from && m.to === to);
      if (!move) return;
      match.state = applyMove(match.state, move);
      io.to(matchId).emit('state', match.state);
    });
  });

  return { app, httpServer };
}

if (require.main === module) {
  const { httpServer } = createApp();
  const port = process.env.PORT || 3000;
  httpServer.listen(port, () => {
    console.log(`server running on :${port}`);
  });
}
