'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const copilot = require('../lib/writers/copilot');
const claude = require('../lib/writers/claude');
const gemini = require('../lib/writers/gemini');

const fakeAgent = {
  id: 'dev',
  data: { name: 'dev', description: 'does dev things', tools: ['read', 'write', 'shell'] },
  body: 'You are the dev agent.',
  raw: '---\nname: dev\n---\nYou are the dev agent.',
};

const fakeSkill = {
  id: 'pr-review',
  data: { name: 'pr-review', description: 'reviews PRs' },
  body: 'Checklist.',
  raw: '---\nname: pr-review\ndescription: reviews PRs\n---\nChecklist.\n',
};

test('copilot: base dir differs by scope, skills/agents do not', () => {
  const root = '/repo';
  assert.equal(copilot.agentPath(root, 'workspace', 'dev'), path.join(root, '.github', 'agents', 'dev.agent.md'));
  assert.equal(copilot.agentPath(root, 'user', 'dev'), path.join(root, '.copilot', 'agents', 'dev.agent.md'));
  assert.equal(copilot.instructionsPath(root, 'workspace'), path.join(root, '.github', 'copilot-instructions.md'));
  assert.equal(copilot.instructionsPath(root, 'user'), path.join(root, '.copilot', 'copilot-instructions.md'));
});

test('copilot: renderAgent omits tools (unconfirmed vocabulary) and includes name/description', () => {
  const out = copilot.renderAgent(fakeAgent);
  assert.match(out, /^---\n/);
  assert.match(out, /name: dev/);
  assert.match(out, /description: does dev things/);
  assert.doesNotMatch(out, /tools:/);
  assert.match(out, /You are the dev agent\./);
});

test('copilot/claude/gemini: renderSkill passes through the Agent Skills source verbatim', () => {
  assert.equal(copilot.renderSkill(fakeSkill), fakeSkill.raw);
  assert.equal(claude.renderSkill(fakeSkill), fakeSkill.raw);
  assert.equal(gemini.renderSkill(fakeSkill), fakeSkill.raw);
});

test('claude: instructions path nests under .claude at user scope, root at workspace scope', () => {
  const root = '/repo';
  assert.equal(claude.instructionsPath(root, 'workspace'), path.join(root, 'CLAUDE.md'));
  assert.equal(claude.instructionsPath(root, 'user'), path.join(root, '.claude', 'CLAUDE.md'));
  assert.equal(claude.agentPath(root, 'workspace', 'dev'), path.join(root, '.claude', 'agents', 'dev.md'));
  assert.equal(claude.agentPath(root, 'user', 'dev'), path.join(root, '.claude', 'agents', 'dev.md'));
});

test('gemini: instructions path nests under .gemini at user scope, root at workspace scope', () => {
  const root = '/repo';
  assert.equal(gemini.instructionsPath(root, 'workspace'), path.join(root, 'GEMINI.md'));
  assert.equal(gemini.instructionsPath(root, 'user'), path.join(root, '.gemini', 'GEMINI.md'));
});

test('gemini: renderAgent maps neutral tool names to Gemini vocabulary', () => {
  const out = gemini.renderAgent(fakeAgent);
  assert.match(out, /kind: local/);
  assert.match(out, /- read_file/);
  assert.match(out, /- write_file/);
  assert.match(out, /- run_shell_command/);
});

test('all writers: renderInstructions wraps the shared body', () => {
  const body = 'Some baseline instructions.';
  assert.match(copilot.renderInstructions(body), /# Copilot Instructions/);
  assert.match(claude.renderInstructions(body), /# CLAUDE\.md/);
  assert.match(gemini.renderInstructions(body), /# GEMINI\.md/);
  for (const writer of [copilot, claude, gemini]) {
    assert.match(writer.renderInstructions(body), /Some baseline instructions\./);
  }
});
