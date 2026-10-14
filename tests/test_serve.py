import http.client
import threading

from modeltests.serve import make_server


def test_server_reads_docs_and_refuses_a_parent_path(tmp_path):
    docs = tmp_path / "docs"
    docs.mkdir()
    (docs / "hello.txt").write_text("hi", encoding="utf-8")
    marker = b"purple-marker-value"
    (tmp_path / "secret.txt").write_bytes(marker)
    server = make_server(docs, port=0)
    port = server.server_address[1]
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        conn = http.client.HTTPConnection("127.0.0.1", port, timeout=5)
        conn.request("GET", "/hello.txt")
        response = conn.getresponse()
        assert response.status == 200
        assert response.read() == b"hi"
        conn.request("GET", "/../secret.txt")
        blocked = conn.getresponse()
        body = blocked.read()
        assert blocked.status != 200
        assert marker not in body
    finally:
        server.shutdown()
        server.server_close()
