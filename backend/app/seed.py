from datetime import datetime, timedelta
from sqlmodel import Session
from .database import engine
from .models import Player, Team, Season, League, Ruleset
from .services import generate_round_robin


def seed():
    with Session(engine) as session:
        players = [Player(name=f"Player {i}") for i in range(1,5)]
        session.add_all(players)
        session.commit()
        teams = [Team(name=f"Team {i}") for i in range(1,5)]
        session.add_all(teams)
        start = datetime.utcnow()
        season = Season(name="Demo Season", start=start, end=start+timedelta(days=30), mode="league")
        session.add(season)
        session.commit()
        league = League(season_id=season.id)
        session.add(league)
        rules = Ruleset()
        session.add(rules)
        session.commit()
        generate_round_robin(session, league.id, season.id, [t.id for t in teams])
        session.commit()

if __name__ == "__main__":
    from .database import init_db
    init_db()
    seed()
    print("Seed data created")
