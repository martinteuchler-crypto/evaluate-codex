from __future__ import annotations
from sqlmodel import Session, select
from .models import Team, Match, Ruleset, Set
from datetime import datetime
from itertools import combinations
from typing import List


def generate_round_robin(session: Session, league_id: int, season_id: int, team_ids: List[int]):
    matches: List[Match] = []
    now = datetime.utcnow()
    for home, away in combinations(team_ids, 2):
        matches.append(Match(league_id=league_id, season_id=season_id, home_team_id=home, away_team_id=away, scheduled_at=now))
        matches.append(Match(league_id=league_id, season_id=season_id, home_team_id=away, away_team_id=home, scheduled_at=now))
    session.add_all(matches)
    session.commit()
    return matches


def validate_sets(rules: Ruleset, sets: List[Set]):
    needed_sets_to_win = rules.best_of_sets // 2 + 1
    home_won = away_won = 0
    for s in sets:
        if s.home_points == s.away_points:
            raise ValueError("no tie set")
        if s.home_points < rules.points_to_win_set and s.away_points < rules.points_to_win_set:
            raise ValueError("points insufficient")
        if rules.win_by_two and abs(s.home_points - s.away_points) < 2:
            raise ValueError("win by two required")
        if s.home_points > s.away_points:
            home_won += 1
        else:
            away_won += 1
    if home_won < needed_sets_to_win and away_won < needed_sets_to_win:
        raise ValueError("match not decided")
    if home_won >= needed_sets_to_win and away_won >= needed_sets_to_win:
        raise ValueError("too many sets")
    return home_won > away_won


def compute_standings(session: Session, league_id: int, rules: Ruleset):
    from collections import defaultdict

    teams = session.exec(select(Team)).all()
    stats = {t.id: {
        "team_id": t.id,
        "points": 0,
        "matches_won": 0,
        "matches_lost": 0,
        "sets_won": 0,
        "sets_lost": 0,
        "points_won": 0,
        "points_lost": 0,
        "head": defaultdict(int)
    } for t in teams}

    matches = session.exec(select(Match).where(Match.league_id==league_id, Match.status=="confirmed")).all()
    for m in matches:
        home = stats[m.home_team_id]
        away = stats[m.away_team_id]
        sets = session.exec(select(Set).where(Set.match_id==m.id).order_by(Set.index)).all()
        home_sets = sum(1 for s in sets if s.home_points > s.away_points)
        away_sets = sum(1 for s in sets if s.away_points > s.home_points)
        home_points = sum(s.home_points for s in sets)
        away_points = sum(s.away_points for s in sets)

        if m.winner_id == m.home_team_id:
            home["matches_won"] += 1
            away["matches_lost"] += 1
            home["points"] += rules.scoring_win_points
        else:
            away["matches_won"] += 1
            home["matches_lost"] += 1
            away["points"] += rules.scoring_win_points

        home["sets_won"] += home_sets
        home["sets_lost"] += away_sets
        away["sets_won"] += away_sets
        away["sets_lost"] += home_sets
        home["points_won"] += home_points
        home["points_lost"] += away_points
        away["points_won"] += away_points
        away["points_lost"] += home_points
        home["head"][m.away_team_id] += rules.scoring_win_points if m.winner_id==m.home_team_id else 0
        away["head"][m.home_team_id] += rules.scoring_win_points if m.winner_id==m.away_team_id else 0

    standings = list(stats.values())

    def sort_key(item):
        return (item["points"],
                item["matches_won"] - item["matches_lost"],
                item["sets_won"] - item["sets_lost"],
                item["points_won"] - item["points_lost"])  # points ratio as fallback

    standings.sort(key=sort_key, reverse=True)

    # direct comparison for ties
    i = 0
    while i < len(standings)-1:
        group = [standings[i]]
        j = i + 1
        while j < len(standings) and sort_key(standings[j]) == sort_key(standings[i]):
            group.append(standings[j])
            j += 1
        if len(group) > 1:
            for t in group:
                t["head_points"] = sum(t["head"].get(o["team_id"], 0) for o in group if o != t)
            group.sort(key=lambda x: (x["head_points"], x["points_won"] - x["points_lost"]), reverse=True)
            standings[i:j] = group
        i = j

    return standings
