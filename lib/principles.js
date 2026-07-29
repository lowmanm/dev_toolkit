'use strict';

const fs = require('fs');
const path = require('path');

function loadTemplates(globalDir) {
  const dir = path.join(globalDir, 'principles-templates');
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({ filename: f, content: fs.readFileSync(path.join(dir, f), 'utf8') }))
    .sort((a, b) => a.filename.localeCompare(b.filename));
}

// Mechanically scaffolds placeholder principles/*.md files for a repo with no
// substantial existing code to derive real content from. Never overwrites a
// file that already exists (unless forced) — principles/ is repo-owned
// content once created, not synced from global/ the way agents/skills/
// instructions are, so it's deliberately not manifest-tracked at all.
function scaffold(root, globalDir, { force = false } = {}) {
  const templates = loadTemplates(globalDir);
  const targetDir = path.join(root, 'principles');
  const created = [];
  const skipped = [];

  for (const template of templates) {
    const filePath = path.join(targetDir, template.filename);
    if (fs.existsSync(filePath) && !force) {
      skipped.push(template.filename);
      continue;
    }
    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(filePath, template.content);
    created.push(template.filename);
  }

  return { created, skipped };
}

module.exports = { loadTemplates, scaffold };
