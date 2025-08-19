# evaluate-codex

This project provides a small collection of physics and astronomy utilities.

## Features

- `contracted_length` – compute the Lorentz contracted length for an object moving at relativistic speeds.
- `light_time_earth_mars` – estimate light travel time between Earth and Mars including the Sun's gravitational delay.
- `SolarSystemGUI` – interactive Tkinter visualization of the solar system with light-path calculations between planets.

## Installation

```
pip install -r requirements.txt
```

## Usage

```
from datetime import date
from space_tools import contracted_length, light_time_earth_mars, SolarSystemGUI

# Length contraction for an object moving at half the speed of light
print(contracted_length(10.0, 0.5))

# Light travel time between Earth and Mars on 1 January 2024
print(light_time_earth_mars(date(2024, 1, 1)))

# Launch the solar system GUI
# SolarSystemGUI().run()
```

## Tests

Run the test suite with:

```
pytest
```
