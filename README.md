# TT-Tracker

Ein einfacher Tischtennis-Tracker für interne Teams.

## Stack

- FastAPI + SQLModel (Postgres)
- React + TypeScript (Vite)
- Docker Compose (web, api, db)

## Wie starten

```bash
docker-compose up --build
```

API läuft anschließend auf `http://localhost:8000`, das Frontend auf `http://localhost:5173`.

## Tests

```bash
pytest
```
