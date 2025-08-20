"""Flask application providing a very small three-player chess server.

The implementation is intentionally lightweight and focuses on allowing
players to join a game via QR code links and input their names.  It does
not implement full chess rules but provides a placeholder board and turn
management so that future work can build upon it.
"""

from __future__ import annotations

import base64
import io
from dataclasses import dataclass, field
from typing import Dict, List

import qrcode
from flask import Flask, redirect, render_template, request, url_for


COLORS = ["white", "black", "red"]


@dataclass
class GameState:
    """In-memory representation of a three-player chess game."""

    players: Dict[str, str] = field(default_factory=dict)
    board: List[List[str]] = field(
        default_factory=lambda: [["." for _ in range(8)] for _ in range(8)]
    )
    turn_order: List[str] = field(default_factory=lambda: COLORS.copy())
    turn_index: int = 0

    def add_player(self, color: str, name: str) -> None:
        if color in COLORS:
            self.players[color] = name

    @property
    def current_turn(self) -> str:
        return self.turn_order[self.turn_index % len(self.turn_order)]


state = GameState()


def generate_qr(url: str) -> str:
    """Return a base64 encoded PNG image containing a QR code for *url*."""

    img = qrcode.make(url)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("ascii")


def create_app() -> Flask:
    """Create and configure the Flask application."""

    app = Flask(__name__, template_folder="templates")

    @app.route("/")
    def index():
        qrs = {
            color: generate_qr(url_for("join", color=color, _external=True))
            for color in COLORS
        }
        return render_template("index.html", qrs=qrs, state=state)

    @app.route("/join/<color>", methods=["GET", "POST"])
    def join(color: str):
        if request.method == "POST":
            name = request.form.get("name", "")
            if name:
                state.add_player(color, name)
                return redirect(url_for("play", color=color))
        return render_template("join.html", color=color)

    @app.route("/play/<color>")
    def play(color: str):
        name = state.players.get(color)
        return render_template(
            "play.html", color=color, name=name, state=state
        )

    return app


__all__ = ["create_app", "generate_qr", "GameState", "state"]
