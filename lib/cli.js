'use strict';

function splitList(s) {
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

function parseArgs(argv) {
  const args = { tools: null, agents: null, skills: null, scope: null, target: null, yes: false, help: false, dryRun: false };
  for (const raw of argv) {
    if (raw === '--help' || raw === '-h') args.help = true;
    else if (raw === '--yes' || raw === '-y') args.yes = true;
    else if (raw === '--dry-run') args.dryRun = true;
    else if (raw.startsWith('--scope=')) args.scope = raw.slice('--scope='.length);
    else if (raw.startsWith('--target=')) args.target = raw.slice('--target='.length);
    else if (raw.startsWith('--tools=')) args.tools = splitList(raw.slice('--tools='.length));
    else if (raw.startsWith('--agents=')) args.agents = splitList(raw.slice('--agents='.length));
    else if (raw.startsWith('--skills=')) args.skills = splitList(raw.slice('--skills='.length));
    else throw new Error(`Unrecognized argument: ${raw}`);
  }
  return args;
}

module.exports = { parseArgs, splitList };
