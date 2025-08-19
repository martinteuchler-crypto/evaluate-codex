import math

C = 299_792_458  # speed of light in m/s

def contracted_length(proper_length: float, speed_fraction: float) -> float:
    """Return the Lorentz contracted length.

    Parameters
    ----------
    proper_length: float
        Length in the object's rest frame (meters).
    speed_fraction: float
        Speed as a multiple of the speed of light. For example, 0.5 means 0.5c.

    Returns
    -------
    float
        The contracted length in meters.
    """
    if not 0 <= abs(speed_fraction) < 1:
        raise ValueError("Speed fraction must be between -1 and 1 (exclusive).")

    gamma = 1.0 / math.sqrt(1 - speed_fraction ** 2)
    return proper_length / gamma


if __name__ == "__main__":
    proper = float(input("Proper length in meters: "))
    fraction = float(input("Speed in multiples of c (e.g., 0.8 for 0.8c): "))
    contracted = contracted_length(proper, fraction)
    print(f"Contracted length: {contracted} m")
