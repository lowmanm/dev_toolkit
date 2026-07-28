'use strict';

const path = require('path');

function renderAgent(agent) {
  const lines = ['---', `name: ${agent.data.name}`, `description: ${agent.data.description}`, '---', ''];
  // Claude Code's subagent tool-name vocabulary isn't confirmed from public
  // docs at scaffold time, so we omit an explicit `tools:` restriction and
  // let the agent inherit Claude Code's default toolset.
  return lines.join('\n') + agent.body.trim() + '\n';
}

function renderSkill(skill) {
  return skill.raw;
}

function renderInstructions(body) {
  return `# CLAUDE.md\n\n${body.trim()}\n`;
}

module.exports = {
  id: 'claude',
  label: 'Claude Code',
  agentPath: (root, _scope, id) => path.join(root, '.claude', 'agents', `${id}.md`),
  skillPath: (root, _scope, id) => path.join(root, '.claude', 'skills', id, 'SKILL.md'),
  // Project scope: CLAUDE.md lives at the repo root.
  // User scope: nested under ~/.claude/ alongside agents and skills.
  instructionsPath: (root, scope) =>
    scope === 'user' ? path.join(root, '.claude', 'CLAUDE.md') : path.join(root, 'CLAUDE.md'),
  renderAgent,
  renderSkill,
  renderInstructions,
};
