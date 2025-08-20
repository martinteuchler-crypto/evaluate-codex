# Table Tennis Tracker

Single-user, offline-first web app for managing table tennis players, teams,
tournaments and leagues. Built with React, Vite and TypeScript.

### Features

- Manage players: add, edit, delete and track Elo rating
- Create teams from players and adjust membership
- Run single-elimination tournaments and enter match winners
- Record league matches with automatic Elo updates

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

## API

Enable the optional backup API when you want to automate exports or imports.

1. Start the server:

   ```bash
   FEATURE_SERVER=true pnpm --filter optional-server start
   ```

2. Use the endpoints:

   - `GET /backup/export` – download the current backup JSON
   - `POST /backup/import` – upload a backup JSON body and store it on disk

   ```bash
   curl http://localhost:3001/backup/export
   curl -X POST http://localhost:3001/backup/import \
     -H "Content-Type: application/json" \
     -d @backup.json
   ```

   The server listens on port 3001 by default.

## Tweaks

- **Elo K factor** – edit `packages/core/src/elo.ts`.
- **Default best-of** – edit `packages/core/src/constants.ts`.
- **League tie-breakers** – edit `packages/core/src/league.ts`.
- **Enable optional server** – set `FEATURE_SERVER=true` when running
  `optional-server` package.
