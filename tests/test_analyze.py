from modeltests.analyze import measure_tree, names_found, typecheck

from support import REPO

COMPILER = REPO / "compiler"


def test_names_match_whole_sequences():
    assert names_found(["src/ports/store.ts", "src/use-case/add.ts", "report/note.ts", "support/help.ts"]) == [
        "port",
        "use-case",
    ]


def test_tree_facts_and_package_import(tmp_path):
    (tmp_path / "ports").mkdir()
    (tmp_path / "use-case").mkdir()
    (tmp_path / "report").mkdir()
    (tmp_path / "support").mkdir()
    (tmp_path / "ports" / "store.ts").write_text(
        'import { x } from "example-lib";\n'
        'import { y } from "./local";\n'
        'export const loaded = import("node:fs");\n'
        "export function addItem() { return x; }\n"
        "export class Cart {}\n"
        "export interface Item {}\n"
        "export type Id = string;\n"
        "export enum Kind { A }\n",
        encoding="utf-8",
    )
    (tmp_path / "use-case" / "add.ts").write_text("export const ready = true;\n", encoding="utf-8")
    (tmp_path / "report" / "note.ts").write_text("export const note = true;\n", encoding="utf-8")
    (tmp_path / "tests").mkdir()
    (tmp_path / "tests" / "cart.test.ts").write_text("export const ok = true;\n", encoding="utf-8")
    (tmp_path / "README.md").write_text("# Cart\n", encoding="utf-8")
    measured = measure_tree(tmp_path)
    assert measured["names_found"] == ["port", "use-case"]
    assert measured["imports"] == ["example-lib", "node:fs"]
    assert measured["top_dirs"] == ["ports", "report", "support", "tests", "use-case"]
    assert measured["checklist"]["tests"] is True
    assert measured["checklist"]["readme"] is True
    assert measured["scans"]["function"] == 1
    assert measured["scans"]["class"] == 1
    assert measured["source_lines"] > measured["test_lines"]


def test_typecheck_pass_and_type_error(tmp_path):
    good = tmp_path / "good"
    good.mkdir()
    (good / "cart.ts").write_text("export const answer = 1;\n", encoding="utf-8")
    passed = typecheck(good, COMPILER)
    assert passed["compile_status"] == "pass"

    bad = tmp_path / "bad"
    bad.mkdir()
    (bad / "bad.ts").write_text('export const answer: number = "no";\n', encoding="utf-8")
    failed = typecheck(bad, COMPILER)
    assert failed["compile_status"] == "fail"
    assert failed["diagnostics"]


def test_declaration_file_does_not_run_tsc(tmp_path, monkeypatch):
    def boom(*_args, **_kwargs):
        raise AssertionError("tsc should not run")

    monkeypatch.setattr("modeltests.analyze._run_tsc", boom)
    (tmp_path / "types.d.ts").write_text("export type Id = string;\n", encoding="utf-8")
    result = typecheck(tmp_path, COMPILER)
    assert result["compile_status"] == "no-typescript"


def test_tsx_alone_fails_without_running_tsc(tmp_path, monkeypatch):
    def boom(*_args, **_kwargs):
        raise AssertionError("tsc should not run")

    monkeypatch.setattr("modeltests.analyze._run_tsc", boom)
    (tmp_path / "view.tsx").write_text("export const view = 1;\n", encoding="utf-8")
    result = typecheck(tmp_path, COMPILER)
    assert result["compile_status"] == "fail"
    assert any("tsx" in line for line in result["diagnostics"])


def test_typecheck_without_tsc_is_an_error(tmp_path):
    code = tmp_path / "code"
    code.mkdir()
    (code / "cart.ts").write_text("export const answer = 1;\n", encoding="utf-8")
    compiler = tmp_path / "compiler"
    compiler.mkdir()
    result = typecheck(code, compiler)
    assert result["compile_status"] == "error"


def test_tsx_forces_fail_even_when_ts_passes(tmp_path):
    (tmp_path / "ok.ts").write_text("export const answer = 1;\n", encoding="utf-8")
    (tmp_path / "view.tsx").write_text("export const view = 1;\n", encoding="utf-8")
    result = typecheck(tmp_path, COMPILER)
    assert result["compile_status"] == "fail"
    assert any("tsx" in line for line in result["diagnostics"])
