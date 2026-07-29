'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { parseFrontmatter, loadAgents, loadSkills, loadInstructions } = require('../lib/source');

test('parseFrontmatter: extracts scalar fields and body', () => {
  const raw = '---\nname: dev\ndescription: does dev things\n---\nHello body.\n';
  const { data, body } = parseFrontmatter(raw);
  assert.equal(data.name, 'dev');
  assert.equal(data.description, 'does dev things');
  assert.equal(body, 'Hello body.\n');
});

test('parseFrontmatter: extracts list fields', () => {
  const raw = '---\nname: gem\ntools:\n  - read\n  - write\n---\nbody\n';
  const { data } = parseFrontmatter(raw);
  assert.deepEqual(data.tools, ['read', 'write']);
});

test('parseFrontmatter: no frontmatter delimiter returns raw as body', () => {
  const raw = 'just some text, no frontmatter';
  const { data, body } = parseFrontmatter(raw);
  assert.deepEqual(data, {});
  assert.equal(body, raw);
});

test('loadAgents/loadSkills/loadInstructions: real global/ source loads without error', () => {
  const globalDir = path.join(__dirname, '..', 'global');
  const agents = loadAgents(globalDir);
  const skills = loadSkills(globalDir);
  const instructions = loadInstructions(globalDir);

  assert.ok(agents.length > 0, 'expected at least one agent');
  assert.ok(skills.length > 0, 'expected at least one skill');
  assert.ok(instructions.length > 0, 'expected non-empty instructions body');

  for (const agent of agents) {
    assert.ok(agent.data.name, `agent ${agent.id} missing name`);
    assert.ok(agent.data.description, `agent ${agent.id} missing description`);
  }
  for (const skill of skills) {
    assert.ok(skill.data.name, `skill ${skill.id} missing name`);
    assert.ok(skill.data.description, `skill ${skill.id} missing description`);
  }
});

test('loadSkills: reads from a fixture directory', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'toolkit-source-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));

  fs.mkdirSync(path.join(dir, 'skills', 'example'), { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'skills', 'example', 'SKILL.md'),
    '---\nname: example\ndescription: an example skill\n---\nBody text.\n'
  );

  const skills = loadSkills(dir);
  assert.equal(skills.length, 1);
  assert.equal(skills[0].id, 'example');
  assert.equal(skills[0].data.name, 'example');
});
