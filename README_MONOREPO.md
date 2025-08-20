# Three Player Chess (Skeleton)

This monorepo contains a minimal implementation of a three-player chess game.
It includes a TypeScript engine, an Express + Socket.IO server, a React/Three.js
client, and infrastructure configuration for Docker deployment.

> **Note**: Game rules and 3D rendering are simplified to keep the example
> concise. Extend the engine and client for full three‑player chess rules.

## Structure

- `packages/engine` – pure TypeScript game engine
- `apps/server` – Express + Socket.IO backend
- `apps/client` – React + Vite frontend
- `e2e` – Playwright placeholder tests
- `infra` – Dockerfiles and configs

## Development

```bash
# install dependencies
npm install --workspaces

# run tests for engine and server
npm test --workspaces

# start server
npm run dev --workspace=@three-chess/server

# start client
npm run dev --workspace=@three-chess/client
```

## Docker Deployment

```bash
cd infra
# build and run
docker-compose build
docker-compose up -d
```

Server listens on `3000`, client on `80`.

## Engine Tweaks

Game constants and rules live in `packages/engine/src`. To adjust the board or
rule set, modify the functions in `game.ts` and `board.ts`.

## Redis Flag

Server is in-memory only. Add a Redis adapter by checking the
`USE_REDIS` environment variable in `apps/server/src/index.ts` and wiring a
Redis client (placeholder).
