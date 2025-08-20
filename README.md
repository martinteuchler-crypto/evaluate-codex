# TT-Tracker

Ein einfacher Tischtennis-Tracker für interne Teams.

## Stack

- FastAPI + SQLModel (Postgres)
- React + TypeScript (Vite)
- Docker Compose (web, api, db)

## Wie starten


Zur Ausführung der Container wird Docker Compose v2 verwendet. Ein `.env`
mit deaktiviertem BuildKit liegt bei, damit auch Umgebungen ohne das Plugin
sauber starten.

```bash
docker compose up --build
```

API läuft anschließend auf `http://localhost:8000`, das Frontend auf `http://localhost:5173`.

## Tests

```bash
pytest
```
