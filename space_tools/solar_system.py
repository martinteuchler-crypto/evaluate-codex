import math
import tkinter as tk
from dataclasses import dataclass
from datetime import datetime

C_KM_PER_S = 299_792.458  # Speed of light in km/s
AU_KM = 149_597_870  # Astronomical unit in kilometers


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

        self.canvas.bind("<Button-1>", self.on_click)

        self.draw_system()
        self.update_selection("A")
        self.update_selection("B")

    def days_since_epoch(self) -> float:
        epoch = datetime(2000, 1, 1)
        return (datetime.utcnow() - epoch).days

    def draw_system(self) -> None:
        self.canvas.delete("all")
        width = int(self.canvas["width"])
        height = int(self.canvas["height"])
        scale = width / (2 * PLANETS[-1].orbit_au * 1.1)
        cx = cy = width / 2

        # Draw orbits and planets
        days = self.days_since_epoch()
        for planet in PLANETS:
            r = planet.orbit_au * scale
            # orbit
            self.canvas.create_oval(cx - r, cy - r, cx + r, cy + r, outline="white")
            # position
            x_au, y_au = planet.position(days)
            x = cx + x_au * scale
            y = cy + y_au * scale
            item = self.canvas.create_oval(x - 6, y - 6, x + 6, y + 6, fill=planet.color, outline="")
            self.canvas.create_text(x + 8, y, text=planet.name, anchor="w", fill="white")
            self.planet_positions[planet.name] = (x, y)
            self.planet_items[planet.name] = item

        # draw selection line if applicable
        self.draw_connection()

    def on_click(self, event: tk.Event) -> None:
        for name, item in self.planet_items.items():
            coords = self.canvas.coords(item)
            x0, y0, x1, y1 = coords
            if x0 <= event.x <= x1 and y0 <= event.y <= y1:
                if self.selection_a is None or self.selection_a == name:
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
        if self.selection_a and self.selection_b and self.selection_a != self.selection_b:
            ax, ay = self.planet_positions[self.selection_a]
            bx, by = self.planet_positions[self.selection_b]
            self.canvas.create_line(ax, ay, bx, by, fill="cyan", tags="path")
            distance = self.distance_between(self.selection_a, self.selection_b)
            time_sec = distance / C_KM_PER_S
            self.info.config(
                text=f"Distance: {distance:,.0f} km  |  Light travel time: {time_sec/60:.2f} min"
            )
        else:
            self.info.config(text="Select planets to view light path")

    def distance_between(self, name_a: str, name_b: str) -> float:
        ax, ay = self.planet_positions[name_a]
        bx, by = self.planet_positions[name_b]
        # Convert from canvas coordinates back to AU
        width = int(self.canvas["width"])
        scale = width / (2 * PLANETS[-1].orbit_au * 1.1)
        ax = (ax - width / 2) / scale
        ay = (ay - width / 2) / scale
        bx = (bx - width / 2) / scale
        by = (by - width / 2) / scale
        dist_au = math.hypot(ax - bx, ay - by)
        return dist_au * AU_KM

    def run(self) -> None:
        self.root.mainloop()


def main() -> None:
    gui = SolarSystemGUI()
    gui.run()


if __name__ == "__main__":
    main()
