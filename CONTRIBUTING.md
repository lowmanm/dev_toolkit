# Contributing to dev_toolkit

This is for people working on the toolkit itself — adding or editing agents/skills, adding a new target CLI, or touching the installer. If you just want to *use* the toolkit, see [README.md](README.md) instead.

## Repo layout

```
global/                 neutral source content — the org-owned source of truth, edit here
  agents/*.agent.md      dev, reviewer, tester, repo-init
  skills/<name>/SKILL.md pr-review, testing-*, dev-*, sdlc-* (Agent Skills format — shared verbatim across all three targets)
  instructions/core.md   baseline instructions, assembled into copilot-instructions.md / CLAUDE.md / GEMINI.md
lib/
  source.js              loads and parses global/ content (frontmatter + body)
  writers/{copilot,claude,gemini}.js   per-target adapters: file paths + frontmatter/body rendering
  manifest.js            checksum helpers, install-manifest read/write
  install.js             writeTracked() — the checksum/conflict decision logic, pruneEmptyDirs()
  cli.js                 argument parsing
  scan.js                deterministic repo inspection (used by `bin/toolkit scan` and the repo-init agent)
bin/toolkit              the CLI entrypoint — thin orchestration over lib/, no logic of its own beyond wiring
test/                    node:test suite — unit tests per lib/ module, plus end-to-end subprocess tests
.github/workflows/ci.yml runs syntax checks + the test suite on push/PR
package.json             only for the "test" script, bin field, and engines.node — bin/toolkit has zero npm runtime dependencies, keep it that way
manifest.json, VERSION   this toolkit's own version/contents metadata (distinct from the per-install .devtoolkit/manifest.json written into a target repo)
```

**Installed output is generated, never hand-authored.** Edit `global/`; never edit the `.github/`, `.claude/`, `.gemini/`, `CLAUDE.md`, `GEMINI.md`, etc. that `bin/toolkit` writes into a target repo or home directory — those are regenerated from `global/` and your edits there would just be flagged as drift on the next update.

## v1 scope — stay inside it

Only four skill areas exist: `dev`, `pr-review`, `testing`, `sdlc`. Do not add security, SRE, architecture, or PM/Jira/Confluence content — that's explicitly deferred to a later version. If you're not sure whether something fits, ask before adding it rather than stretching one of the existing four areas to cover it.

## Adding a new skill

1. Create `global/skills/<skill-id>/SKILL.md`. `<skill-id>` is lowercase, hyphenated (matches the Agent Skills standard's naming convention, which all three target CLIs use natively).
2. Frontmatter needs `name` (matches `<skill-id>`) and `description` (what it's for *and* when to use it — this is what the target CLI uses to decide when to invoke the skill automatically, so be concrete, not vague).
3. The body is the skill's actual content — plain markdown, no special syntax beyond what a human would write.
4. No writer changes needed — skills pass through to all three targets verbatim, since Copilot CLI, Claude Code, and Gemini CLI all implement the same Agent Skills format.
5. Add a test case to `test/source.test.js` or `test/scan.test.js` only if you're changing loading/detection logic, not for adding content itself. Do add a line to the README's skills table.

## Adding a new agent

1. Create `global/agents/<agent-id>.agent.md`. Frontmatter: `name`, `description`, optional `tools` (a flat list from the neutral vocabulary: `read`, `write`, `edit`, `search`, `shell`).
2. The body is the agent's system prompt.
3. Each writer renders agents differently — see `lib/writers/*.js`. Gemini CLI maps the neutral `tools` list to its own vocabulary (`TOOL_MAP` in `lib/writers/gemini.js`); Copilot and Claude Code currently omit `tools:` entirely and let the agent inherit the default toolset, because neither CLI's tool-name vocabulary was confirmed from public docs at the time this was built (see Known open items below) — if you confirm those, wire up a real mapping the same way Gemini's is done.
4. Add a row to the README's agents table.

## Adding a new target CLI

Each target is one file in `lib/writers/` implementing this interface:

```js
{
  id, label,
  agentPath(root, scope, id) -> string,
  skillPath(root, scope, id) -> string,
  instructionsPath(root, scope) -> string,
  renderAgent(agent) -> string,       // agent = { id, data: {name, description, tools}, body, raw }
  renderSkill(skill) -> string,       // usually just `skill.raw` — see "Adding a new skill" above
  renderInstructions(body) -> string,
}
```

Register it in the `writers` object in `bin/toolkit`, and in `ALL_TOOLS` will pick it up automatically. Add path-mapping tests in `test/writers.test.js` following the existing pattern (workspace vs. user scope, since several targets change their base directory name — or don't — between the two).

## The manifest / conflict-detection design

Every file the installer writes is tracked in `.devtoolkit/manifest.json` (inside whatever root got installed to) with two hashes per file:

- `outputHash` — hash of the exact content last written.
- `sourceHash` — hash of the `global/` source content it was rendered from.

On a later run, `writeTracked()` (`lib/install.js`) compares the file currently on disk against `outputHash` to detect a local edit, and separately compares the current `global/` source against the recorded `sourceHash` to detect whether the org content moved. That gives four outcomes instead of a binary overwrite/skip:

| On-disk edited? | Source changed upstream? | Outcome |
|---|---|---|
| no | no | no-op |
| no | yes | regenerate, write the update |
| yes | no | leave it — "local edit preserved" |
| yes | yes | leave it — reported as a **conflict** needing manual merge |

If you touch this logic, the test matrix in `test/install.test.js` covers exactly these four cases plus the "foreign file with no manifest entry" case (a file exists but the toolkit never wrote it — never overwritten, reported separately) — extend it rather than replacing it.

## Testing

```
npm test
```

Runs the full `node:test` suite (unit tests per `lib/` module, plus subprocess-driven end-to-end tests that actually run `bin/toolkit` against a temp directory and check the files it produces). Zero extra dependencies — it's Node's built-in test runner. `.github/workflows/ci.yml` runs the same thing plus `node --check` on every file, on push/PR.

Add tests alongside any `lib/` change. The end-to-end tests in `test/integration.test.js` are the ones most likely to catch a regression in the actual install/update/uninstall behavior a user would hit — prefer extending those over writing something in isolation if you're changing user-facing CLI behavior.

## Known open items

Things that are best-effort assumptions rather than confirmed facts, in case you're in a position to verify or fix them:

- GitHub Copilot CLI's user-scope instructions file path (`~/.copilot/copilot-instructions.md`) — not documented as of writing; GitHub has an open feature request for user-level instructions support. Update `lib/writers/copilot.js` if/when this ships with a different real path.
- Gemini CLI's user-scope `GEMINI.md` path (`~/.gemini/GEMINI.md`) — inferred by pattern from the confirmed project-scope behavior, not independently doc-confirmed.
- Copilot CLI's and Claude Code's agent `tools:` frontmatter vocabulary — unconfirmed, so those two writers omit the field and let agents inherit the default toolset. Gemini CLI's vocabulary *is* confirmed (its docs give a concrete example), hence `TOOL_MAP` exists only in `lib/writers/gemini.js`.
