from datetime import date

import pytest

from light_time import light_time_earth_mars


def test_light_time_jan_1_2024():
    time, distance = light_time_earth_mars(date(2024, 1, 1))
    assert time == pytest.approx(1209.4972313058947, rel=1e-9)
    assert distance == pytest.approx(362598147917.38873, rel=1e-9)
