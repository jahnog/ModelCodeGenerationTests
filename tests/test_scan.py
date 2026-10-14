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


def test_docs_urls_are_relative():
    for name in ("index.html", "app.js", "style.css"):
        text = (REPO / "docs" / name).read_text(encoding="utf-8")
        assert 'src="/' not in text
        assert 'href="/' not in text
        assert 'fetch("/' not in text
        assert "fetch('/" not in text
        assert "url(/" not in text
    assert (REPO / "docs" / ".nojekyll").is_file()
