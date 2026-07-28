'use strict';

const path = require('path');

// GitHub Copilot CLI is the one target where the user-scope root folder name
// differs from the workspace-scope one (~/.copilot vs .github in-repo).
function baseDir(scope) {
  return scope === 'user' ? '.copilot' : '.github';
}

function renderAgent(agent) {
  const lines = ['---', `name: ${agent.data.name}`, `description: ${agent.data.description}`, '---', ''];
  // Copilot's agent tool-name vocabulary isn't confirmed from public docs at
  // scaffold time, so we omit an explicit `tools:` restriction and let the
  // agent inherit Copilot's default toolset.
  return lines.join('\n') + agent.body.trim() + '\n';
}

function renderSkill(skill) {
  // Agent Skills (SKILL.md + name/description frontmatter) is a shared open
  // standard across Copilot, Claude Code, and Gemini CLI — pass through as-is.
  return skill.raw;
}

function renderInstructions(body) {
  return `# Copilot Instructions\n\n${body.trim()}\n`;
}

module.exports = {
  id: 'copilot',
  label: 'GitHub Copilot CLI',
  agentPath: (root, scope, id) => path.join(root, baseDir(scope), 'agents', `${id}.agent.md`),
  skillPath: (root, scope, id) => path.join(root, baseDir(scope), 'skills', id, 'SKILL.md'),
  instructionsPath: (root, scope) => path.join(root, baseDir(scope), 'copilot-instructions.md'),
  renderAgent,
  renderSkill,
  renderInstructions,
};
