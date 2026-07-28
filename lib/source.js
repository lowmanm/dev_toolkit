'use strict';

const fs = require('fs');
const path = require('path');

// Minimal frontmatter parser for our controlled source format:
//   ---
//   key: value
//   listkey:
//     - a
//     - b
//   ---
//   body...
// Not a general YAML parser — source files are hand-authored and simple by design.
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  const [, fmText, rest] = match;
  const data = {};
  let currentListKey = null;
  for (const line of fmText.split(/\r?\n/)) {
    const listItem = line.match(/^\s*-\s+(.*)$/);
    if (listItem && currentListKey) {
      data[currentListKey].push(listItem[1].trim());
      continue;
    }
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (kv) {
      const [, key, value] = kv;
      if (value === '') {
        data[key] = [];
        currentListKey = key;
      } else {
        data[key] = value.trim();
        currentListKey = null;
      }
    }
  }
  return { data, body: rest.replace(/^\r?\n/, '') };
}

function loadAgents(globalDir) {
  const dir = path.join(globalDir, 'agents');
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.agent.md'))
    .map((f) => {
      const id = f.replace(/\.agent\.md$/, '');
      const raw = fs.readFileSync(path.join(dir, f), 'utf8');
      const { data, body } = parseFrontmatter(raw);
      return { id, data, body, raw };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

function loadSkills(globalDir) {
  const dir = path.join(globalDir, 'skills');
  return fs
    .readdirSync(dir)
    .filter((name) => fs.statSync(path.join(dir, name)).isDirectory())
    .map((id) => {
      const raw = fs.readFileSync(path.join(dir, id, 'SKILL.md'), 'utf8');
      const { data, body } = parseFrontmatter(raw);
      return { id, data, body, raw };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

function loadInstructions(globalDir) {
  return fs.readFileSync(path.join(globalDir, 'instructions', 'core.md'), 'utf8');
}

module.exports = { parseFrontmatter, loadAgents, loadSkills, loadInstructions };
