import base64

from three_player_chess import create_app, generate_qr


def test_generate_qr_returns_png():
    data = generate_qr("http://example.com")
    assert isinstance(data, str)
    img = base64.b64decode(data)
    assert img.startswith(b"\x89PNG")


def test_join_flow():
    app = create_app()
    client = app.test_client()

    resp = client.get("/join/white")
    assert resp.status_code == 200
    assert b"Join as White" in resp.data

    resp = client.post("/join/white", data={"name": "Alice"}, follow_redirects=True)
    assert resp.status_code == 200
    assert b"Alice" in resp.data
