# dev_toolkit

The org's internal dev toolkit: agents, skills, and instructions for **development, PR review, testing, and SDLC process** — generated for GitHub Copilot CLI, Claude Code, and Gemini CLI at once, from one install command. Security, SRE, architecture, and PM/Jira/Confluence tooling are not covered yet.

## Quick start

Clone the toolkit, then run it from inside whichever project you want it in:

```
git clone https://github.com/lowmanm/dev_toolkit.git
cd dev_toolkit
```

```
./bin/toolkit
```

Running it with no flags asks you two things: scope (this PC vs. just this project) and which agents/skills/CLIs to include, defaulting to all. Answer the prompts, or use the non-interactive commands below.

> Requires Node.js. No `npm install` needed — `./bin/toolkit` runs as-is. On Windows, use `node bin/toolkit` instead of `./bin/toolkit`.

## Installing into your current project

This is **workspace scope** — writes into the current project's `.github/`, `.claude/`, `.gemini/`, committed to git and shared with your team:

```
./bin/toolkit --scope=workspace --yes
```

## Installing for yourself, across every project

This is **user scope** — writes into your home directory (`~/.copilot/`, `~/.claude/`, `~/.gemini/`), available in every project you open on this machine, never committed anywhere:

```
./bin/toolkit --scope=user --yes
```

## Installing only part of it

Pick specific target CLIs, agents, or skills instead of everything:

```
./bin/toolkit --scope=workspace --tools=claude --agents=dev,reviewer --skills=pr-review --yes
```

## Updating

Re-run the exact same command you installed with — it detects the existing install and updates in place, reusing your prior selection:

```
./bin/toolkit
```

If you've hand-edited a generated file, an update leaves it alone rather than overwriting it. If the org content for that same file *also* changed since your edit, that's called out explicitly as a conflict to merge by hand — you'll never lose an edit silently, and you'll never miss an upstream change silently either.

## Checking status without changing anything

```
./bin/toolkit status
```

Shows what's installed and flags any conflicts, without writing anything.

## Previewing an install or update

```
./bin/toolkit --dry-run
```

Add `--dry-run` to any install/update command to see what would happen without touching disk.

## Removing the toolkit

```
./bin/toolkit uninstall
```

Deletes only the files that still match what the toolkit generated. Anything you've hand-edited locally is left in place and reported, not deleted. Add `--yes` to skip the confirmation prompt.

## Inspecting a repo before installing

```
./bin/toolkit scan
```

Reports the repo's detected stack, test tooling, CI, and any existing toolkit install — without installing anything. Useful before deciding what to install, or just to see what's there.

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
