# Model tests

Compare how coding agents generate the same TypeScript task when the prompt adds a different architecture or style instruction.

Each cell is one agent variant (CLI, model, and effort) and one suffix. The harness records wall-clock time, tokens, cost, tree shape, and a typecheck with the pinned compiler. A static page in `docs/` shows the comparison.

## Commands

Every command in this section runs from the repository root.

### Install

Python 3.13 or newer is required. `uv sync` installs the project and its development tools.

```bash
uv sync
```

### Uninstall

No uninstall command exists.

### Run

```bash
uv run modeltests list
uv run modeltests run
uv run modeltests demo
uv run modeltests publish
uv run modeltests analyze
uv run modeltests scan
uv run modeltests serve
```

- `list` prints every enabled cell and the prompt it would send, then lists disabled variants and suffixes.
- `run` runs every enabled cell, one at a time, then publishes. Filters: `--variant`, `--agent`, `--suffix`, `--family`. `--force` reruns a cell that already finished today.
- `demo` writes a badged sample for each enabled cell that has no live attempt, then publishes.
- `publish` rebuilds `docs/data` and `docs/code` from saved attempts.
- `analyze` remeasures saved code and reruns the typecheck. It does not publish.
- `scan` fails if a tracked file contains a private key, a token, or a home-directory path.
- `serve` previews `docs/` at `http://127.0.0.1:8765`. Open that address on this machine.

Every command accepts `--config`.

Samples are not measurements. A cell badged **sample** was written by `demo` so the page has something to show. It is left out of the totals.

### Test

```bash
uv run pytest
```

### Debug

No debug command exists.

### Mutation test

```bash
uv run pytest --gremlins --gremlin-targets=src/modeltests
```

This mutates `src/modeltests` with the unit tests.

### Reports

These files are build output. `coverage.xml` is the Cobertura file. `htmlcov/index.html` is the HTML index.

```bash
uv run coverage run -m pytest
uv run coverage xml -o coverage.xml
uv run coverage html -d htmlcov
```

## Compiler

The typecheck uses the compiler pinned in this repository. From the repository root:

```bash
npm ci --prefix compiler
```

`compiler/package.json` pins the TypeScript version named in the constraints. `compiler/tsconfig.json` is the only compiler-option list.

## Configuration

Edit `config/benchmark.yaml`. Variants need an agent (`grok`, `claude`, or `cursor`), a model, and an effort. Suffixes need an id, a family, a label, and the instruction text. Set `enabled: false` to drop an entry from the run and from the page without deleting it. Publish again after a change.

## GitHub Pages

The site is the `docs/` folder. It has no build step. GitHub Pages uses the `master` branch and the `/docs` folder. The public address is `https://jahnog.github.io/ModelCodeGenerationTests/`. `modeltests publish` rebuilds `docs/data` and `docs/code` on the machine that has `runs/`. Pushing `master` deploys that committed folder. No Actions workflow is required.

`docs/data` and `docs/code` are generated. Generated code under `docs/code/` is marked linguist-generated.

Do not commit `runs/` or `output-code/`. Those folders keep raw logs and the live agent workspace. Do not commit private keys, tokens, account names, personal email addresses, home-directory paths, or local agent-rules text.

`modeltests scan` checks the files git would track. A failed publish scan leaves the previous site in place. The scan does not stop an agent from reading secrets on the machine during a live run.

## License

The license is MIT (`LICENSE`).
