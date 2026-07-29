# dev_toolkit

The org's internal dev toolkit: agents, skills, and instructions for **development, PR review, testing, and SDLC process** — generated for GitHub Copilot CLI, Claude Code, and Gemini CLI at once, from one install command. Security, SRE, architecture, and PM/Jira/Confluence tooling are not covered yet.

## Quick start

There are two ways to run it — a one-off run with no local clone, or a local clone you keep around and re-run.

**Option A — run directly, no local clone to manage:**
```
npx github:<org>/dev_toolkit
```

(replace `<org>/dev_toolkit` with wherever this repo actually lives). `npx` fetches it and runs `bin/toolkit` on the spot — nothing persists locally afterward. It still needs `git` access to that repo under the hood (same permissions a manual clone would need), it just skips you having to manage a local copy or remember to `git pull` before re-running. Flags append the same way:

**Option A with flags:**
```
npx github:<org>/dev_toolkit --scope=workspace --yes
```

**Option B — clone it locally** (useful if you want to inspect the source, or `npx` fetching from git isn't available on your network):
```
git clone <repo-url>
cd dev_toolkit
./bin/toolkit
```

Either way, running it with no flags asks you two things: scope (this PC vs. just this project) and which agents/skills/CLIs to include, defaulting to all. Answer the prompts, or use the non-interactive commands in the rest of this README.

> Requires Node.js. No `npm install` needed — `bin/toolkit` runs as-is (zero runtime dependencies, which is also what makes the `npx` option above work without an install step). On Windows with a local clone, use `node bin/toolkit` instead of `./bin/toolkit`.

The rest of this README shows commands as `./bin/toolkit ...` for brevity — swap in `npx github:<org>/dev_toolkit ...` if you're using Option A instead of a local clone.

## Scopes

Scope controls *where* content is written — the same agents/skills/instructions get generated either way, just to a different location:

| Scope | Writes to | Committed to git? | Use when |
|---|---|---|---|
| **workspace** | The current project (`.github/`, `.claude/`, `.gemini/` at the repo root) | Yes — shared with your team | You want this available to everyone working in this specific project |
| **user** | Your home directory (`~/.copilot/`, `~/.claude/`, `~/.gemini/`) | No — never committed anywhere | You want this available to yourself in every project on this machine |

**Workspace scope:**
```
./bin/toolkit --scope=workspace --yes
```

**User scope:**
```
./bin/toolkit --scope=user --yes
```

## Selecting what to install

By default every target CLI, agent, and skill is installed. Pick specific ones instead with `--tools`, `--agents`, and `--skills`:

**Custom selection:**
```
./bin/toolkit --scope=workspace --tools=claude --agents=dev,reviewer --skills=pr-review --yes
```

## Updating

Re-run the exact same command you installed with — it detects the existing install and updates in place, reusing your prior selection. If you've hand-edited a generated file, an update leaves it alone rather than overwriting it. If the org content for that same file *also* changed since your edit, that's called out explicitly as a conflict to merge by hand — you'll never lose an edit silently, and you'll never miss an upstream change silently either.

**Update:**
```
./bin/toolkit
```

## Checking status without changing anything

Shows what's installed and flags any conflicts, without writing anything.

**Status:**
```
./bin/toolkit status
```

## Previewing an install or update

Add `--dry-run` to any install/update command to see what would happen without touching disk.

**Preview:**
```
./bin/toolkit --dry-run
```

## Removing the toolkit

Deletes only the files that still match what the toolkit generated. Anything you've hand-edited locally is left in place and reported, not deleted.

**Uninstall:**
```
./bin/toolkit uninstall
```

**Uninstall without a confirmation prompt:**
```
./bin/toolkit uninstall --yes
```

## Inspecting a repo before installing

Reports the repo's detected stack, test tooling, CI, and any existing toolkit install — without installing anything. Useful before deciding what to install, or just to see what's there.

**Scan:**
```
./bin/toolkit scan
```

## Bootstrapping a brand-new repo

Rather than installing everything blind, run the **`repo-init`** agent from inside the target repo (via whichever of the three CLIs you use — e.g. `/agent repo-init` in Copilot CLI). It scans the repo first, figures out what's actually relevant (which CLIs are in use, whether test tooling exists, what stack this is), and then runs `bin/toolkit` with a sensible selection instead of installing every agent and skill unconditionally.

## What's included

### Agents

| Agent | What it's for |
|---|---|
| `dev` | Implementing features, scaffolding new code, configuring local environments — org conventions. |
| `reviewer` | Reviewing pull requests/diffs against the org's gold-standard checklist before merge. |
| `tester` | Writing or reviewing unit and integration tests against org standards and coverage expectations. |
| `repo-init` | Bootstraps the toolkit into a new repo — scans first, then installs only what's relevant. Run this one first in a new project. |

### Skills

| Area | Skill | What it covers |
|---|---|---|
| dev | `dev-scaffolding` | Project layout, naming, and where new components/services/modules should live. |
| dev | `dev-environment-setup` | Local dependency, env var, and setup conventions. |
| pr-review | `pr-review` | The gold-standard PR review checklist — correctness, tests, security, scope, readability. |
| testing | `testing-unit` | Unit test standards and coverage expectations. |
| testing | `testing-integration` | Integration test standards — when to write them, what they should cover. |
| sdlc | `sdlc-request-review` | How to request a code review at this org. **Placeholder** — real process/links TBD. |
| sdlc | `sdlc-new-app` | How to stand up a new application at this org. **Placeholder** — real process/links TBD. |

The `sdlc-*` skills are intentionally placeholder content today — this toolkit was built before the org's actual SDLC policy existed to point to. They'll be filled in with real links and steps once that policy exists; everything else (the install mechanics, the checksum-based update safety, the other skill content) doesn't depend on that and is usable now.

### Instructions

One baseline instructions doc, generated per target as `copilot-instructions.md` / `CLAUDE.md` / `GEMINI.md`, pointing at the agents and skills above.

## Target CLIs

| CLI | Agents | Skills | Instructions |
|---|---|---|---|
| GitHub Copilot CLI | `.github/agents/*.agent.md` | `.github/skills/<name>/SKILL.md` | `.github/copilot-instructions.md` |
| Claude Code | `.claude/agents/*.md` | `.claude/skills/<name>/SKILL.md` | `CLAUDE.md` |
| Gemini CLI | `.gemini/agents/*.md` | `.gemini/skills/<name>/SKILL.md` | `GEMINI.md` |

At user scope, the same relative paths are written under your home directory (e.g. `~/.claude/agents/`), except Copilot CLI, which uses `~/.copilot/` at user scope instead of `~/.github/`.

## Known limitations

- GitHub Copilot CLI's user-scope instructions file location isn't officially documented yet (as of writing, this is an open upstream feature request) — `~/.copilot/copilot-instructions.md` is our best-effort guess. If Copilot doesn't seem to pick up instructions at user scope, this is why.
- Gemini CLI's user-scope `GEMINI.md` path is likewise inferred by pattern rather than doc-confirmed.
- Security, SRE, architecture, and PM/Jira/Confluence tooling are out of scope for this version — they'll come later as their own skill areas.

## Contributing

Want to add a skill, agent, or another target CLI, or work on the installer itself? See [CONTRIBUTING.md](CONTRIBUTING.md).
