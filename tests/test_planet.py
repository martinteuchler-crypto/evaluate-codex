import pytest

from space_tools import Planet


def test_planet_position_quarter_orbit():
    planet = Planet("Test", 1.0, 4.0, "white")
    x, y = planet.position(1.0)
    assert x == pytest.approx(0.0, abs=1e-9)
    assert y == pytest.approx(1.0, rel=1e-9)
