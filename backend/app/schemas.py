from __future__ import annotations
from datetime import datetime
from typing import List
from pydantic import BaseModel


class SeasonCreate(BaseModel):
    name: str
    start: datetime
    end: datetime
    mode: str


class LeagueCreate(BaseModel):
    season_id: int


class MatchReportSet(BaseModel):
    index: int
    home_points: int
    away_points: int


class MatchReport(BaseModel):
    sets: List[MatchReportSet]


class TeamStanding(BaseModel):
    team_id: int
    points: int
    matches_won: int
    matches_lost: int
    sets_won: int
    sets_lost: int
    points_won: int
    points_lost: int
