# evaluate-codex

This project provides a small collection of physics and astronomy utilities.

## Features

- `contracted_length` – compute the Lorentz contracted length for an object moving at relativistic speeds.
- `light_time_earth_mars` – estimate light travel time between Earth and Mars including the Sun's gravitational delay.
- Web-based solar system visualization – interactive browser view of the solar system
  with geometric and Shapiro-delay–corrected light-path calculations.

## Installation

```
pip install -r requirements.txt
```

## Usage

```
from datetime import date
from space_tools import contracted_length, light_time_earth_mars

# Length contraction for an object moving at half the speed of light
print(contracted_length(10.0, 0.5))

# Light travel time between Earth and Mars on 1 January 2024
print(light_time_earth_mars(date(2024, 1, 1)))
```

### Launching the web app

Run the Flask application and open the resulting URL in a browser:

```bash
python -m space_tools.solar_system
```

## Tests

Run the test suite with:

```
pytest
```
