# Table Tennis Tracker

Single-user, offline-first web app for managing table tennis players, teams,
tournaments and leagues. Built with React, Vite and TypeScript.

## Quick start (development)

```bash
pnpm i && pnpm -r dev
```

## Build & preview

```bash
pnpm -r build && pnpm --filter @app/web preview
```

## Backup / restore

Use the Data page in the app to export or import a JSON backup file.

## Tweaks

- **Elo K factor** – edit `packages/core/src/elo.ts`.
- **Default best-of** – edit `packages/core/src/constants.ts`.
- **League tie-breakers** – edit `packages/core/src/league.ts`.
- **Enable optional server** – set `FEATURE_SERVER=true` when running
  `optional-server` package.
