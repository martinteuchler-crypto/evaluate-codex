# evaluate-codex

This project provides a small collection of physics and astronomy utilities.

## Features

- `contracted_length` – compute the Lorentz contracted length for an object moving at relativistic speeds.
- `light_time_earth_mars` – estimate light travel time between Earth and Mars including the Sun's gravitational delay.
- `SolarSystemGUI` – interactive Tkinter visualization of the solar system with light-path calculations between planets.
  Pick any two planets to see both the straight geometric light path and the Shapiro-delay–corrected path.  The canvas supports
  mouse or keyboard controls to pan and zoom, and a *Distortion* slider exaggerates the relativistic bending for clarity.

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
```

### Launching the GUI

You can launch the interactive solar system visualization in two ways:

1. **From a Python session**

   ```python
   from space_tools import SolarSystemGUI
   SolarSystemGUI().run()
   ```

2. **From the command line**

   ```bash
   python -m space_tools.solar_system
   ```

### Using the GUI

- **Select planets:** choose Planet A and B from the drop-down menus or left/right click planets on the canvas.
- **Pan:** drag with the middle mouse button.
- **Zoom:** scroll the mouse wheel or press `+` / `-` (`KP_Add` / `KP_Subtract`).
- **Distortion slider:** exaggerate gravitational bending to highlight the Shapiro delay.
- **Info banner:** shows geometric vs. corrected path lengths and light-travel times for the selected pair.

## Tests

Run the test suite with:

```
pytest
```
