"""Preview docs/ over HTTP. The public site is the same set of files."""

from __future__ import annotations

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


def make_server(directory: Path, host: str = "127.0.0.1", port: int = 8765) -> ThreadingHTTPServer:
    handler = partial(SimpleHTTPRequestHandler, directory=str(directory))
    return ThreadingHTTPServer((host, port), handler)


def serve(directory: Path, host: str = "127.0.0.1", port: int = 8765) -> None:
    server = make_server(directory, host, port)
    print(f"serving {directory} at http://{host}:{port}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        return
    finally:
        server.server_close()
