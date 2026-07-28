'use strict';

const path = require('path');

// Neutral -> Gemini CLI tool-name mapping (confirmed against Gemini CLI's
// documented subagent example, which lists tools like read_file/grep_search).
const TOOL_MAP = {
  read: 'read_file',
  write: 'write_file',
  edit: 'edit_file',
  search: 'grep_search',
  shell: 'run_shell_command',
};

function renderAgent(agent) {
  const lines = ['---', `name: ${agent.data.name}`, `description: ${agent.data.description}`, 'kind: local'];
  const neutralTools = Array.isArray(agent.data.tools) ? agent.data.tools : [];
  if (neutralTools.length) {
    lines.push('tools:');
    for (const t of neutralTools) {
      lines.push(`  - ${TOOL_MAP[t] || t}`);
    }
  }
  lines.push('---', '');
  return lines.join('\n') + agent.body.trim() + '\n';
}

function renderSkill(skill) {
  return skill.raw;
}

function renderInstructions(body) {
  return `# GEMINI.md\n\n${body.trim()}\n`;
}

module.exports = {
  id: 'gemini',
  label: 'Gemini CLI',
  agentPath: (root, _scope, id) => path.join(root, '.gemini', 'agents', `${id}.md`),
  skillPath: (root, _scope, id) => path.join(root, '.gemini', 'skills', id, 'SKILL.md'),
  // Project scope: GEMINI.md lives at the repo root.
  // User scope: nested under ~/.gemini/ (inferred by pattern; not doc-confirmed).
  instructionsPath: (root, scope) =>
    scope === 'user' ? path.join(root, '.gemini', 'GEMINI.md') : path.join(root, 'GEMINI.md'),
  renderAgent,
  renderSkill,
  renderInstructions,
};
