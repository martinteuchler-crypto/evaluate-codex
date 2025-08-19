import pytest

from space_tools import contracted_length


def test_contracted_length_half_c():
    assert contracted_length(10.0, 0.5) == pytest.approx(8.660254037844386, rel=1e-9)


def test_contracted_length_invalid_speed():
    with pytest.raises(ValueError):
        contracted_length(10.0, 1.0)
