"""Command line for the comparison harness."""

from __future__ import annotations

import argparse
import sys

from modeltests.config import ConfigError, load_config, workspace_from_config
from modeltests.prompt import build_prompt, build_slug
from modeltests.publish import PublishError, local_today, publish_site, scan_repo
from modeltests.runner import analyze_saved, plan_cells, run_cells, write_demos


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="modeltests")
    parser.add_argument("--config", default="config/benchmark.yaml")
    commands = parser.add_subparsers(dest="command", required=True)

    commands.add_parser("list", help="print the enabled cells and their prompts")
    run = commands.add_parser("run", help="run enabled cells one at a time")
    _filters(run)
    run.add_argument("--force", action="store_true", help="rerun today's matching cell")
    commands.add_parser("demo", help="write sample attempts, then publish")
    commands.add_parser("publish", help="rebuild docs/data and docs/code")
    commands.add_parser("serve", help="preview docs/ at 127.0.0.1:8765")
    commands.add_parser("analyze", help="remeasure saved code without publishing")
    commands.add_parser("scan", help="fail if a tracked file looks private")

    args = parser.parse_args(argv)
    if args.command == "serve":
        from modeltests.serve import serve

        ws = workspace_from_config(args.config)
        ws.docs.mkdir(parents=True, exist_ok=True)
        serve(ws.docs)
        return 0
    try:
        ws = workspace_from_config(args.config)
        cfg = load_config(ws.config_path, ws.root)
    except ConfigError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    for warning in cfg.warnings:
        print(f"warning: {warning}", file=sys.stderr)
    try:
        if args.command == "list":
            _list(cfg)
        elif args.command == "run":
            cells = plan_cells(
                cfg,
                variant=args.variant,
                agent=args.agent,
                suffix=args.suffix,
                family=args.family,
            )
            if not cells:
                print("no enabled cells match")
                return 0
            results = run_cells(cells=cells, ws=ws, cfg=cfg, force=args.force, today=local_today())
            for result in results:
                print(
                    f"{result['action']} {result.get('variant_id')} {result.get('suffix_id')} {result.get('slug')}"
                )
            matrix = publish_site(ws, cfg)
            print(f"published {len(matrix['cells'])} days")
        elif args.command == "demo":
            results = write_demos(ws, cfg, today=local_today())
            for result in results:
                print(f"{result['action']} {result.get('variant_id')} {result.get('suffix_id')}")
            matrix = publish_site(ws, cfg)
            print(f"published {len(matrix['cells'])} days")
        elif args.command == "publish":
            matrix = publish_site(ws, cfg)
            print(f"published {len(matrix['cells'])} days")
        elif args.command == "analyze":
            count = analyze_saved(ws, cfg)
            print(f"analyzed {count} attempts")
        elif args.command == "scan":
            problems = scan_repo(ws.root)
            if problems:
                for problem in problems:
                    print(problem, file=sys.stderr)
                return 1
            print("scan passed")
    except PublishError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    return 0


def _filters(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--variant")
    parser.add_argument("--agent")
    parser.add_argument("--suffix")
    parser.add_argument("--family")


def _list(cfg) -> None:
    today = local_today()
    cells = cfg.cells()
    print(f"task {cfg.task_id}")
    print(f"enabled cells: {len(cells)}")
    for variant, suffix in cells:
        slug = build_slug(variant.agent, variant.model, variant.effort, suffix.id, today)
        print(
            f"[{variant.id}] {variant.label} | model {variant.model} | effort {variant.effort} "
            f"| suffix {suffix.label} ({suffix.family}) | {slug}"
        )
        print("prompt:")
        print(build_prompt(cfg.task_text, suffix.text, cfg.constraints))
        print("----")
    disabled_variants = [item for item in cfg.variants if not item.enabled]
    disabled_suffixes = [item for item in cfg.suffixes if not item.enabled]
    print("disabled variants:")
    if disabled_variants:
        for item in disabled_variants:
            print(f"- {item.id} {item.label} model {item.model} effort {item.effort} disabled")
    else:
        print("- none")
    print("disabled suffixes:")
    if disabled_suffixes:
        for item in disabled_suffixes:
            print(f"- {item.id} {item.label} ({item.family}) disabled")
    else:
        print("- none")


if __name__ == "__main__":
    raise SystemExit(main())
