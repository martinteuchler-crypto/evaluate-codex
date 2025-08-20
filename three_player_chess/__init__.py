"""Web-based three-player chess game."""

# Importing the Flask application or QR helpers at module import time causes the
# ``three_player_chess.app`` module to be loaded eagerly.  When the package is
# executed as ``python -m three_player_chess.app`` this resulted in the module
# already being present in ``sys.modules`` before its ``__main__`` block ran,
# triggering a ``RuntimeWarning``.  To avoid this, the public functions are
# re-exported lazily so that ``three_player_chess.app`` is only imported when
# they are actually used.

from __future__ import annotations

from types import ModuleType


def _lazy_import() -> ModuleType:
    """Return the ``three_player_chess.app`` module on demand."""

    from . import app

    return app


def create_app():
    """Proxy to :func:`three_player_chess.app.create_app`."""

    return _lazy_import().create_app()


def generate_qr(url: str) -> str:
    """Proxy to :func:`three_player_chess.app.generate_qr`."""

    return _lazy_import().generate_qr(url)


__all__ = ["create_app", "generate_qr"]

