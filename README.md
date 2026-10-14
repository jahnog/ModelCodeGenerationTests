# Model tests

Compare how coding agents generate the same TypeScript task when the prompt adds a different architecture or style instruction.

Each cell is one agent variant (CLI, model, and effort) and one suffix. The harness records wall-clock time, tokens, cost, tree shape, and a typecheck with the pinned compiler. A static page in `docs/` shows the comparison.

## Setup

```bash
uv sync
npm ci --prefix compiler
uv run modeltests list
uv run modeltests demo
uv run modeltests serve
```

`serve` previews `docs/` at `http://127.0.0.1:8765`. Open that address on this machine.

## Commands

- `uv run modeltests list` prints every enabled cell and the prompt it would send, then lists disabled variants and suffixes.
- `uv run modeltests run` runs every enabled cell, one at a time. Filters: `--variant`, `--agent`, `--suffix`, `--family`. `--force` reruns a cell that already finished today.
- `uv run modeltests demo` writes a badged sample for each enabled cell that has no live attempt, then publishes.
- `uv run modeltests publish` rebuilds `docs/data` and `docs/code` from saved attempts.
- `uv run modeltests analyze` remeasures saved code and reruns the typecheck. It does not publish.
- `uv run modeltests scan` fails if a tracked file contains a private key, a token, or a home-directory path.
- Every command accepts `--config`.

Samples are not measurements. A cell badged **sample** was written by `demo` so the page has something to show. It is left out of the totals.

## Configuration

Edit `config/benchmark.yaml`. Variants need an agent (`grok`, `claude`, or `cursor`), a model, and an effort. Suffixes need an id, a family, a label, and the instruction text. Set `enabled: false` to drop an entry from the run and from the page without deleting it. Publish again after a change.

`compiler/package.json` pins the TypeScript version named in the constraints. `compiler/tsconfig.json` is the only compiler-option list.

## GitHub Pages

The site is the `docs/` folder. It has no build step. In the repository settings, set GitHub Pages to the `main` branch and the `/docs` folder. The public address is `https://<user>.github.io/<repo>/`. Pushing `main` updates the live site. No Actions workflow is required.

`docs/data` and `docs/code` are generated. Generated code under `docs/code/` is marked linguist-generated.

Do not commit `runs/` or `output-code/`. Those folders keep raw logs and the live agent workspace. Do not commit private keys, tokens, account names, personal email addresses, home-directory paths, or local agent-rules text.

`modeltests scan` checks the files git would track. A failed publish scan leaves the previous site in place. The scan does not stop an agent from reading secrets on the machine during a live run.
