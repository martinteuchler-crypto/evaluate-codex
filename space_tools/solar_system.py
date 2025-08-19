import math
import tkinter as tk
from dataclasses import dataclass
from datetime import datetime

C_KM_PER_S = 299_792.458  # Speed of light in km/s
AU_KM = 149_597_870  # Astronomical unit in kilometers
C_M_PER_S = C_KM_PER_S * 1000
AU_M = AU_KM * 1000
# Standard gravitational parameter GM of the Sun in m^3/s^2
MU_SUN = 1.32712440018e20


@dataclass
class Planet:
    name: str
    orbit_au: float  # Semi-major axis in astronomical units
    period_days: float  # Orbital period in Earth days
    color: str

    def position(self, days: float) -> tuple[float, float]:
        """Return x, y coordinates in AU for the given days since epoch."""
        angle = 2 * math.pi * (days / self.period_days)
        x = self.orbit_au * math.cos(angle)
        y = self.orbit_au * math.sin(angle)
        return x, y


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


class SolarSystemGUI:
    def __init__(self) -> None:
        self.root = tk.Tk()
        self.root.title("Solar System Light Path")

        self.canvas = tk.Canvas(self.root, width=800, height=800, bg="black")
        self.canvas.grid(row=0, column=0, columnspan=4)

        self.planet_positions: dict[str, tuple[float, float]] = {}
        self.planet_items: dict[str, int] = {}
        self.selection_a: str | None = None
        self.selection_b: str | None = None
        self.zoom = 1.0
        self.pan_x = 0
        self.pan_y = 0
        self._last_drag_x = 0
        self._last_drag_y = 0

        names = [p.name for p in PLANETS]
        self.var_a = tk.StringVar(value=names[2])
        self.var_b = tk.StringVar(value=names[3])
        self.var_a.trace_add("write", lambda *_: self.update_selection("A"))
        self.var_b.trace_add("write", lambda *_: self.update_selection("B"))

        tk.Label(self.root, text="Planet A:").grid(row=1, column=0)
        tk.OptionMenu(self.root, self.var_a, *names).grid(row=1, column=1)
        tk.Label(self.root, text="Planet B:").grid(row=1, column=2)
        tk.OptionMenu(self.root, self.var_b, *names).grid(row=1, column=3)

        self.info = tk.Label(self.root, text="Select planets to view light path", fg="white", bg="black")
        self.info.grid(row=2, column=0, columnspan=4, sticky="ew")

        self.canvas.bind("<Button-1>", lambda e: self.on_click(e, "A"))
        self.canvas.bind("<Button-3>", lambda e: self.on_click(e, "B"))
        self.canvas.bind("<ButtonPress-2>", self.on_pan_start)
        self.canvas.bind("<B2-Motion>", self.on_pan_move)
        self.root.bind_all("<MouseWheel>", self.on_mousewheel)
        self.root.bind_all("<Button-4>", self.on_mousewheel)
        self.root.bind_all("<Button-5>", self.on_mousewheel)
        self.root.bind_all("<KeyPress-plus>", self.on_key_zoom)
        self.root.bind_all("<KeyPress-minus>", self.on_key_zoom)
        self.root.bind_all("<KeyPress-KP_Add>", self.on_key_zoom)
        self.root.bind_all("<KeyPress-KP_Subtract>", self.on_key_zoom)

        self.distortion_var = tk.IntVar(value=1)
        tk.Scale(
            self.root,
            from_=1,
            to=10,
            orient="horizontal",
            label="Distortion",
            variable=self.distortion_var,
            command=lambda _=None: self.update_distortion(),
        ).grid(row=3, column=0, columnspan=4, sticky="ew")
        self.distortion_strength = 0.0

        self.draw_system()
        self.update_selection("A")
        self.update_selection("B")

    def days_since_epoch(self) -> float:
        epoch = datetime(2000, 1, 1)
        return (datetime.utcnow() - epoch).days

    def draw_system(self) -> None:
        self.canvas.delete("all")
        self.planet_positions.clear()
        self.planet_items.clear()
        width = int(self.canvas["width"])
        base_scale = width / (2 * PLANETS[-1].orbit_au * 1.1)
        scale = base_scale * self.zoom
        self.cx = width / 2 + self.pan_x
        self.cy = width / 2 + self.pan_y
        self.draw_sun_and_distortion(self.cx, self.cy)

        # Draw orbits and planets
        days = self.days_since_epoch()
        for planet in PLANETS:
            r = planet.orbit_au * scale
            # orbit
            self.canvas.create_oval(self.cx - r, self.cy - r, self.cx + r, self.cy + r, outline="white")
            # position
            x_au, y_au = planet.position(days)
            x = self.cx + x_au * scale
            y = self.cy + y_au * scale
            item = self.canvas.create_oval(x - 6, y - 6, x + 6, y + 6, fill=planet.color, outline="")
            self.canvas.create_text(x + 8, y, text=planet.name, anchor="w", fill="white")
            self.planet_positions[planet.name] = (x, y)
            self.planet_items[planet.name] = item

        # draw selection line if applicable
        self.draw_connection()

    def on_click(self, event: tk.Event, which: str) -> None:
        for name, item in self.planet_items.items():
            x0, y0, x1, y1 = self.canvas.coords(item)
            if x0 <= event.x <= x1 and y0 <= event.y <= y1:
                if which == "A":
                    self.var_a.set(name)
                else:
                    self.var_b.set(name)
                return

    def update_selection(self, which: str) -> None:
        if which == "A":
            self.selection_a = self.var_a.get()
        else:
            self.selection_b = self.var_b.get()
        self.highlight_selection()
        self.draw_connection()

    def highlight_selection(self) -> None:
        for name, item in self.planet_items.items():
            outline = "yellow" if name in {self.selection_a, self.selection_b} else ""
            self.canvas.itemconfig(item, outline=outline)

    def draw_connection(self) -> None:
        self.canvas.delete("path")
        self.canvas.delete("path_shapiro")
        if self.selection_a and self.selection_b and self.selection_a != self.selection_b:
            ax, ay = self.planet_positions[self.selection_a]
            bx, by = self.planet_positions[self.selection_b]
            # Straight line (geometric path)
            self.canvas.create_line(ax, ay, bx, by, fill="cyan", tags="path")

            # Curved line to illustrate Shapiro bending
            mid_x = (ax + bx) / 2
            mid_y = (ay + by) / 2
            bend = 0.2 * self.distortion_strength
            ctrl_x = mid_x + (self.cx - mid_x) * bend
            ctrl_y = mid_y + (self.cy - mid_y) * bend
            self.canvas.create_line(
                ax,
                ay,
                ctrl_x,
                ctrl_y,
                bx,
                by,
                smooth=True,
                fill="magenta",
                tags="path_shapiro",
            )

            geom_km, proper_km, geom_s, proper_s = self.light_path(
                self.selection_a, self.selection_b
            )
            self.info.config(
                text=(
                    f"Geom: {geom_km:,.0f} km ({geom_s/60:.2f} min)  |  "
                    f"Proper: {proper_km:,.0f} km ({proper_s/60:.2f} min)"
                )
            )
        else:
            self.info.config(text="Select planets to view light path")

    def distance_between(self, name_a: str, name_b: str) -> float:
        ax, ay = self.planet_positions[name_a]
        bx, by = self.planet_positions[name_b]
        # Convert from canvas coordinates back to AU
        width = int(self.canvas["width"])
        base_scale = width / (2 * PLANETS[-1].orbit_au * 1.1)
        scale = base_scale * self.zoom
        ax = (ax - self.cx) / scale
        ay = (ay - self.cy) / scale
        bx = (bx - self.cx) / scale
        by = (by - self.cy) / scale
        dist_au = math.hypot(ax - bx, ay - by)
        return dist_au * AU_KM

    def light_path(self, name_a: str, name_b: str) -> tuple[float, float, float, float]:
        """Return geometric and Shapiro-corrected light path lengths and times.

        Returns
        -------
        tuple
            ``(geom_km, proper_km, geom_s, proper_s)``
        """
        ax, ay = self.planet_positions[name_a]
        bx, by = self.planet_positions[name_b]
        width = int(self.canvas["width"])
        base_scale = width / (2 * PLANETS[-1].orbit_au * 1.1)
        scale = base_scale * self.zoom
        ax_au = (ax - self.cx) / scale
        ay_au = (ay - self.cy) / scale
        bx_au = (bx - self.cx) / scale
        by_au = (by - self.cy) / scale
        r1_m = math.hypot(ax_au, ay_au) * AU_M
        r2_m = math.hypot(bx_au, by_au) * AU_M
        R_m = math.hypot(ax_au - bx_au, ay_au - by_au) * AU_M
        delay = shapiro_delay(r1_m, r2_m, R_m)
        delay *= 1 + self.distortion_strength
        geom_m = R_m
        proper_m = R_m + C_M_PER_S * delay
        geom_s = geom_m / C_M_PER_S
        proper_s = proper_m / C_M_PER_S
        return geom_m / 1000, proper_m / 1000, geom_s, proper_s

    def adjust_zoom(self, factor: float) -> None:
        self.zoom *= factor
        self.draw_system()
        self.highlight_selection()

    def on_mousewheel(self, event: tk.Event) -> None:
        if getattr(event, "delta", 0) > 0 or getattr(event, "num", None) == 4:
            self.adjust_zoom(1.1)
        else:
            self.adjust_zoom(1 / 1.1)

    def on_key_zoom(self, event: tk.Event) -> None:
        if event.keysym in {"plus", "KP_Add"}:
            self.adjust_zoom(1.1)
        elif event.keysym in {"minus", "KP_Subtract"}:
            self.adjust_zoom(1 / 1.1)

    def on_pan_start(self, event: tk.Event) -> None:
        self._last_drag_x = event.x
        self._last_drag_y = event.y

    def on_pan_move(self, event: tk.Event) -> None:
        dx = event.x - self._last_drag_x
        dy = event.y - self._last_drag_y
        self._last_drag_x = event.x
        self._last_drag_y = event.y
        self.pan_x += dx
        self.pan_y += dy
        self.draw_system()
        self.highlight_selection()

    def update_distortion(self) -> None:
        value = int(self.distortion_var.get())
        self.distortion_strength = (value - 1) * (10 / 9)
        self.draw_system()
        self.highlight_selection()

    def draw_sun_and_distortion(self, cx: float, cy: float) -> None:
        sun_radius = 10
        self.canvas.create_oval(
            cx - sun_radius,
            cy - sun_radius,
            cx + sun_radius,
            cy + sun_radius,
            fill="yellow",
            outline="",
        )
        strength = self.distortion_strength
        for i in range(1, 6):
            r = sun_radius + i * 15 * (1 + strength)
            self.canvas.create_oval(cx - r, cy - r, cx + r, cy + r, outline="gold", tags="distortion")

    def run(self) -> None:
        self.root.mainloop()


def main() -> None:
    gui = SolarSystemGUI()
    gui.run()


if __name__ == "__main__":
    main()
