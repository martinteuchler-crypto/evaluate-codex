# 3-Player Chess MVP

## Dev run
1. `pnpm i`
2. `pnpm --filter server dev`
3. `pnpm --filter client dev`

## Build & serve
```
pnpm -r build
pnpm --filter server start
```

## Docker
```
docker compose up --build
```

## Tweaks
- Rules/engine constants: `server/src/engine.ts`
- Board layout: `client/src/board.json`
