"""Web-based visualization of the solar system and light paths.

This module exposes a small Flask application that renders an interactive
HTML5 canvas showing the orbits of the planets.  Users can select two planets
and the page will display both the geometric light-path length between them
and the Shapiro-delay–corrected path.  The heavy lifting is performed in
client-side JavaScript; the Python code below mainly sets up the data model and
serves the web page.

The ``Planet`` dataclass and ``shapiro_delay`` function remain available for
programmatic use and are re-exported from :mod:`space_tools`.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from flask import Flask, render_template

# Physical constants
C_KM_PER_S = 299_792.458  # Speed of light in km/s
AU_KM = 149_597_870  # Astronomical unit in kilometers
C_M_PER_S = C_KM_PER_S * 1000
AU_M = AU_KM * 1000
# Standard gravitational parameter GM of the Sun in m^3/s^2
MU_SUN = 1.32712440018e20


@dataclass
class Planet:
    """Simple representation of an orbiting body."""

    name: str
    orbit_au: float  # Semi-major axis in astronomical units
    period_days: float  # Orbital period in Earth days
    color: str

    def position(self, days: float) -> tuple[float, float]:
        """Return ``(x, y)`` coordinates in AU for ``days`` since epoch."""

        angle = 2 * math.pi * (days / self.period_days)
        x = self.orbit_au * math.cos(angle)
        y = self.orbit_au * math.sin(angle)
        return x, y


# Basic planet data
PLANETS = [
    Planet("Mercury", 0.39, 88, "gray"),
    Planet("Venus", 0.72, 225, "orange"),
    Planet("Earth", 1.00, 365, "blue"),
    Planet("Mars", 1.52, 687, "red"),
    Planet("Jupiter", 5.20, 4333, "sienna"),
    Planet("Saturn", 9.58, 10759, "gold"),
    Planet("Uranus", 19.20, 30687, "light blue"),
    Planet("Neptune", 30.05, 60190, "dark blue"),
]


def shapiro_delay(r1_m: float, r2_m: float, R_m: float) -> float:
    """Return the Shapiro delay for a signal in seconds.

    Parameters
    ----------
    r1_m, r2_m : float
        Distances from the Sun to the two bodies in meters.
    R_m : float
        Euclidean separation between the bodies in meters.
    """

    denom = r1_m + r2_m - R_m
    if denom <= 0:
        return 0.0
    return (2 * MU_SUN / C_M_PER_S**3) * math.log((r1_m + r2_m + R_m) / denom)


def create_app() -> Flask:
    """Return a configured :class:`~flask.Flask` application."""

    app = Flask(__name__, template_folder="templates")

    @app.route("/")
    def index() -> str:
        return render_template("solar_system.html", planets=PLANETS)

    return app


def main() -> None:  # pragma: no cover - manual invocation helper
    app = create_app()
    app.run(debug=True)


if __name__ == "__main__":  # pragma: no cover
    main()

