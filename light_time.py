"""Compute light travel time between Earth and Mars accounting for solar curvature."""
from __future__ import annotations

from datetime import date, datetime
from typing import Tuple, Union

import math
import ephem

# Physical constants
C = 299_792_458.0  # Speed of light in m/s
G = 6.67430e-11  # Gravitational constant in m^3 kg^-1 s^-2
M_SUN = 1.98847e30  # Mass of the Sun in kg
MU_SUN = G * M_SUN
AU_IN_METERS = ephem.meters_per_au


def light_time_earth_mars(dt: Union[date, datetime]) -> Tuple[float, float]:
    """Return light travel time and distance between Earth and Mars.

    Parameters
    ----------
    dt : datetime.date or datetime.datetime
        Date for which to compute the separation in UTC.

    Returns
    -------
    Tuple[float, float]
        A tuple ``(seconds, meters)`` representing the light travel time and
        the corresponding proper distance travelled by a photon including the
        Shapiro delay induced by the Sun's gravitational field.
    """
    eph_date = ephem.Date(dt)
    sun = ephem.Sun(eph_date)
    mars = ephem.Mars(eph_date)

    r_e = float(sun.earth_distance) * AU_IN_METERS
    r_m = float(mars.sun_distance) * AU_IN_METERS
    R = float(mars.earth_distance) * AU_IN_METERS

    shapiro = (2 * MU_SUN / C**3) * math.log((r_e + r_m + R) / (r_e + r_m - R))

    time = R / C + shapiro
    distance = C * time
    return time, distance


__all__ = ["light_time_earth_mars"]
