from __future__ import annotations
from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import Session, select, delete
from .database import init_db, get_session
from .models import Season, League, Team, Match, Set, Ruleset
from .schemas import SeasonCreate, LeagueCreate, MatchReport
from .services import generate_round_robin, validate_sets, compute_standings

app = FastAPI()


@app.on_event("startup")
def on_startup():
    init_db()


@app.post("/api/seasons")
def create_season(payload: SeasonCreate, session: Session = Depends(get_session)):
    season = Season.from_orm(payload)
    session.add(season)
    session.commit()
    session.refresh(season)
    return season


@app.post("/api/leagues")
def create_league(payload: LeagueCreate, session: Session = Depends(get_session)):
    league = League.from_orm(payload)
    session.add(league)
    session.commit()
    session.refresh(league)
    return league


@app.post("/api/leagues/{league_id}/schedule")
def schedule_league(league_id: int, session: Session = Depends(get_session)):
    teams = session.exec(select(Team.id)).all()
    league = session.get(League, league_id)
    if not league:
        raise HTTPException(status_code=404, detail="league not found")
    matches = generate_round_robin(session, league_id, league.season_id, teams)
    return matches


@app.post("/api/matches/{match_id}/report")
def report_match(match_id: int, payload: MatchReport, session: Session = Depends(get_session)):
    match = session.get(Match, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="match not found")
    rules = session.exec(select(Ruleset).limit(1)).first()
    if not rules:
        rules = Ruleset()
        session.add(rules)
        session.commit()
        session.refresh(rules)
    sets = [Set(match_id=match_id, index=s.index, home_points=s.home_points, away_points=s.away_points) for s in payload.sets]
    try:
        home_won = validate_sets(rules, sets)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    session.exec(delete(Set).where(Set.match_id==match_id))
    session.add_all(sets)
    match.status = "played"
    match.winner_id = match.home_team_id if home_won else match.away_team_id
    session.commit()
    return {"winner_id": match.winner_id}


@app.post("/api/matches/{match_id}/confirm")
def confirm_match(match_id: int, session: Session = Depends(get_session)):
    match = session.get(Match, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="match not found")
    match.status = "confirmed"
    session.commit()
    return match


@app.get("/api/standings")
def get_standings(leagueId: int, session: Session = Depends(get_session)):
    rules = session.exec(select(Ruleset).limit(1)).first()
    if not rules:
        rules = Ruleset()
        session.add(rules)
        session.commit()
    standings = compute_standings(session, leagueId, rules)
    return standings
