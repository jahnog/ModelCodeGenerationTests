from modeltests.publish import scan_repo

from support import REPO


def test_scan_passes_on_this_tree():
    assert scan_repo(REPO) == []


def test_scan_reports_a_category_without_the_secret(tmp_path):
    (tmp_path / ".gitignore").write_text("runs/\noutput-code/\n", encoding="utf-8")
    secret = ("sk" + "-") + "abcd"
    (tmp_path / "notes.txt").write_text("token " + secret + "\n", encoding="utf-8")
    problems = scan_repo(tmp_path)
    assert problems
    assert problems[0].startswith("notes.txt")
    assert secret not in "\n".join(problems)


def test_scan_requires_ignored_run_folders(tmp_path):
    (tmp_path / ".gitignore").write_text("*.pyc\n", encoding="utf-8")
    (tmp_path / "readme.txt").write_text("hello\n", encoding="utf-8")
    problems = scan_repo(tmp_path)
    assert any("runs/" in problem for problem in problems)
    assert any("output-code/" in problem for problem in problems)


def test_scan_requires_a_gitignore(tmp_path):
    (tmp_path / "readme.txt").write_text("hello\n", encoding="utf-8")
    assert scan_repo(tmp_path) == ["gitignore is missing"]


def test_scan_reports_a_private_key_without_the_key(tmp_path):
    (tmp_path / ".gitignore").write_text("runs/\noutput-code/\n", encoding="utf-8")
    body = "not-a-real-key"
    begin = "-----BEGIN " + "PRIVATE KEY-----"
    end = "-----END " + "PRIVATE KEY-----"
    key = begin + "\n" + body + "\n" + end + "\n"
    (tmp_path / "notes.txt").write_text(key, encoding="utf-8")
    problems = scan_repo(tmp_path)
    assert problems
    assert problems[0].startswith("notes.txt")
    assert "private key" in problems[0]
    assert body not in "\n".join(problems)


def test_scan_reports_a_bearer_token_without_the_token(tmp_path):
    (tmp_path / ".gitignore").write_text("runs/\noutput-code/\n", encoding="utf-8")
    token = "abcd" + "1234"
    label = "Bea" + "rer "
    (tmp_path / "notes.txt").write_text(label + token + "\n", encoding="utf-8")
    problems = scan_repo(tmp_path)
    assert problems
    assert problems[0].startswith("notes.txt")
    assert "bearer token" in problems[0]
    assert token not in "\n".join(problems)


def test_scan_reports_a_home_path_without_the_path(tmp_path):
    (tmp_path / ".gitignore").write_text("runs/\noutput-code/\n", encoding="utf-8")
    marker = "/" + "home/" + "person"
    (tmp_path / "notes.txt").write_text("see " + marker + "\n", encoding="utf-8")
    problems = scan_repo(tmp_path)
    assert problems
    assert problems[0].startswith("notes.txt")
    assert "home path" in problems[0]
    assert marker not in "\n".join(problems)


def test_scan_command_fails_on_a_home_path(tmp_path, capsys):
    from modeltests.cli import main

    from support import small_config, write_project

    config = write_project(tmp_path, small_config())
    marker = "/" + "home/" + "person"
    (tmp_path / "notes.txt").write_text("see " + marker + "\n", encoding="utf-8")
    assert main(["--config", str(config), "scan"]) == 1
    captured = capsys.readouterr()
    assert "home path" in captured.err
    assert marker not in captured.err
    assert marker not in captured.out


def test_docs_urls_are_relative():
    for name in ("index.html", "app.js", "style.css"):
        text = (REPO / "docs" / name).read_text(encoding="utf-8")
        assert 'src="/' not in text
        assert 'href="/' not in text
        assert 'fetch("/' not in text
        assert "fetch('/" not in text
        assert "url(/" not in text
    assert (REPO / "docs" / ".nojekyll").is_file()
