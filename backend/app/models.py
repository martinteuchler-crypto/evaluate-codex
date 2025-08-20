from __future__ import annotations
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    role: str


class Player(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: Optional[str] = None
    rating: Optional[int] = None


class TeamPlayer(SQLModel, table=True):
    team_id: int = Field(foreign_key="team.id", primary_key=True)
    player_id: int = Field(foreign_key="player.id", primary_key=True)


class Team(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    captain_player_id: Optional[int] = Field(default=None, foreign_key="player.id")





class Season(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    start: datetime
    end: datetime
    mode: str


class League(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    season_id: int = Field(foreign_key="season.id")


class Ruleset(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    best_of_sets: int = 5
    points_to_win_set: int = 11
    win_by_two: bool = True
    scoring_win_points: int = 3


class Match(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    league_id: int = Field(foreign_key="league.id")
    season_id: int = Field(foreign_key="season.id")
    home_team_id: int = Field(foreign_key="team.id")
    away_team_id: int = Field(foreign_key="team.id")
    scheduled_at: datetime
    status: str = "scheduled"
    winner_id: Optional[int] = Field(default=None, foreign_key="team.id")



class Set(SQLModel, table=True):
    match_id: int = Field(foreign_key="match.id", primary_key=True)
    index: int = Field(primary_key=True)
    home_points: int
    away_points: int

