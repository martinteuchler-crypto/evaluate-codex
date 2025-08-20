import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import crypto from 'crypto';
import { createInitial, generateLegalMoves, applyMove, GameState, Color } from './engine';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

const games: Record<string, { state: GameState; players: Record<string, { token: string; color: Color; name: string }> }> = {};

app.post('/api/create', (req, res) => {
  const code = Math.random().toString(36).slice(2,8).toUpperCase();
  games[code] = { state: createInitial(), players: {} };
  res.json({ code });
});

app.post('/api/join', (req, res) => {
  const { code, name, color } = req.body;
  const game = games[code];
  if (!game) return res.status(404).end();
  const token = crypto.randomBytes(8).toString('hex');
  game.players[token] = { token, color, name };
  res.json({ token });
});

if(process.env.NODE_ENV==='production'){
  app.use(express.static(path.resolve('../client/dist')));
}

const httpServer = createServer(app);
const io = new Server(httpServer);

io.on('connection', socket => {
  socket.on('join', ({ token }) => {
    let gameCode: string | undefined;
    let player: any;
    for (const [code, g] of Object.entries(games)) {
      if (g.players[token]) { gameCode = code; player = g.players[token]; break; }
    }
    if (!gameCode) return;
    socket.join(gameCode);
    socket.emit('state', games[gameCode].state);

    socket.on('requestState', () => socket.emit('state', games[gameCode!].state));

    socket.on('submitMove', (move) => {
      const game = games[gameCode!];
      const state = game.state;
      const piece = state.pieces[move.from];
      if (!piece || piece.color !== state.turn) return;
      const legal = generateLegalMoves(state, move.from);
      if (!legal.includes(move.to)) return;
      applyMove(state, move);
      io.to(gameCode!).emit('state', state);
    });

    socket.on('resign', () => {
      const game = games[gameCode!];
      game.state.eliminated[player.color] = true;
      io.to(gameCode!).emit('state', game.state);
    });
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log('server listening on', PORT));
