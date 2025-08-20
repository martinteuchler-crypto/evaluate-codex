import os, sys
if os.path.exists("test.db"): os.remove("test.db")
sys.path.insert(0, os.path.abspath('.'))
os.environ["DATABASE_URL"] = "sqlite:///./test.db"

from fastapi.testclient import TestClient
from sqlmodel import Session, select
from backend.app.database import init_db, engine
from backend.app.models import Team, Match
from backend.app.main import app

client = TestClient(app)

def setup_module():
    init_db()
    with Session(engine) as session:
        session.add_all([Team(name=f"Team {i}") for i in range(1,5)])
        session.commit()

def test_league_flow():
    season = client.post("/api/seasons", json={
        "name": "S1",
        "start": "2024-01-01T00:00:00",
        "end": "2024-12-31T00:00:00",
        "mode": "league"
    }).json()
    league = client.post("/api/leagues", json={"season_id": season["id"]}).json()
    client.post(f"/api/leagues/{league['id']}/schedule")
    with Session(engine) as session:
        matches = session.exec(select(Match)).all()
        m1, m2 = matches[0].id, matches[1].id
    r1 = client.post(f"/api/matches/{m1}/report", json={
        "sets": [
            {"index":1,"home_points":11,"away_points":9},
            {"index":2,"home_points":11,"away_points":9},
            {"index":3,"home_points":11,"away_points":9}
        ]
    })
    assert r1.status_code == 200
    client.post(f"/api/matches/{m1}/confirm")
    bad = client.post(f"/api/matches/{m2}/report", json={
        "sets": [{"index":1,"home_points":11,"away_points":10}]
    })
    assert bad.status_code == 400
    r2 = client.post(f"/api/matches/{m2}/report", json={
        "sets": [
            {"index":1,"home_points":9,"away_points":11},
            {"index":2,"home_points":9,"away_points":11},
            {"index":3,"home_points":9,"away_points":11}
        ]
    })
    assert r2.status_code == 200
    client.post(f"/api/matches/{m2}/confirm")
    res = client.get(f"/api/standings?leagueId={league['id']}")
    assert res.status_code == 200
    standings = res.json()
    assert len(standings) == 4
