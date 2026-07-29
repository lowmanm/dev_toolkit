# dev_toolkit

Internal agentic dev toolkit. v1 covers core dev workflow only — scaffolding/environment setup, PR review, testing standards, and SDLC process docs — generated for GitHub Copilot CLI, Claude Code, and Gemini CLI at once. Security, SRE, architecture, and PM tooling are out of scope for now.

## Install / update

One command, two scopes:

```
bin/toolkit                          # interactive: choose scope, first run installs, later runs update
bin/toolkit --scope=workspace        # install/update into the current project (.github, .claude, .gemini)
bin/toolkit --scope=user             # install/update on this machine (~/.copilot, ~/.claude, ~/.gemini), available in every project
bin/toolkit --yes                    # non-interactive, use defaults (all tools/agents/skills) or flags below
bin/toolkit --tools=claude --agents=dev,reviewer --skills=pr-review
```

Re-running with no flags updates an existing install in place, reusing its prior selection. A checksum is recorded per generated file, tracked against both the rendered output and the org source it came from — if you've hand-edited a file locally, the next update leaves it alone. If the org source for that same file *also* changed upstream, it's reported as a conflict needing a manual merge rather than a plain preserved edit, so you're not stuck comparing hashes by hand to tell the two apart.

Requires Node.js (no npm install needed to run it — `bin/toolkit` has zero runtime dependencies; `npm install` is only needed if you want to run this repo's own test suite).

## Other commands

```
bin/toolkit status                   # what's installed here, including any conflicts - never writes anything
bin/toolkit --dry-run                # preview an install/update without writing anything
bin/toolkit uninstall                # remove a previous install; leaves hand-edited files in place, deletes the rest
bin/toolkit uninstall --yes          # skip the confirmation prompt
```

`uninstall` only deletes files that still match what the toolkit last generated — anything you've hand-edited is left on disk and reported, not deleted. The install manifest itself is always removed, so a later `bin/toolkit` run there is treated as a fresh install.

## Inspecting a repo without installing

```
bin/toolkit scan                     # human-readable summary of the current directory
bin/toolkit scan --target=../other-repo --json
```

Reports detected stack(s), test tooling, CI, CODEOWNERS, and any existing toolkit install per CLI, all from deterministic filesystem checks — no LLM judgment involved. This is what the `repo-init` agent shells out to instead of re-deriving repo state via ad hoc search on every run.

## Layout

```
global/                 neutral source content — org-owned, edit here
  agents/*.agent.md      dev, reviewer, tester, repo-init
  skills/<name>/SKILL.md pr-review, testing-*, dev-*, sdlc-* (Agent Skills format, shared across all three targets)
  instructions/core.md   baseline instructions assembled into copilot-instructions.md / CLAUDE.md / GEMINI.md
lib/                     bin/toolkit's implementation
  writers/{copilot,claude,gemini}.js   per-target adapters (path + frontmatter mapping)
  manifest.js, source.js, scan.js, install.js, cli.js
bin/toolkit              the install/update/scan/status/uninstall entrypoint
test/                    node:test suite (unit tests per lib/ module + end-to-end CLI tests)
.github/workflows/ci.yml CI: syntax check + test suite on push/PR
user/                    personal scratch/override space for people developing this repo (see user/README.md)
manifest.json, VERSION   this toolkit's own version/contents metadata
package.json             only for the "test" script and engines.node — bin/toolkit itself has no npm dependencies
```

Installed output is generated, not hand-authored — edit `global/`, not the files `bin/toolkit` writes into a target repo or home directory.

## Scope semantics

- **workspace** — installs into the current project (`.github/`, `.claude/`, `.gemini/` at the repo root). Committed to git, shared with the team.
- **user** — installs into your home directory (`~/.copilot/`, `~/.claude/`, `~/.gemini/`). Available in every project on your machine, never committed anywhere.

Scope only controls *where* content lands — the same agents/skills/instructions are generated either way.

## Bootstrapping a new repo

Run the `repo-init` agent from within the target repo (via whichever of the three CLIs you use) before installing blind — it scans the repo for what's already there and what's actually relevant, then runs `bin/toolkit` with a sensible selection instead of installing everything unconditionally. See `global/agents/repo-init.agent.md`.

## Known open items

- GitHub Copilot CLI's user-scope instructions path (`~/.copilot/copilot-instructions.md`) is inferred by pattern, not doc-confirmed — GitHub hasn't shipped/documented this yet as of writing.
- Gemini CLI's user-scope `GEMINI.md` path is likewise inferred by pattern.
- Agent `tools:` frontmatter is only populated for Gemini CLI (whose docs give a concrete tool-name vocabulary); Copilot and Claude Code agents omit it and inherit the default toolset until each tool's exact vocabulary is confirmed.
