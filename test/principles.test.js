'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { loadTemplates, scaffold } = require('../lib/principles');

const GLOBAL_DIR = path.join(__dirname, '..', 'global');

function tmpDir(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'toolkit-principles-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

test('loadTemplates: real global/principles-templates loads architecture/design/domain', () => {
  const templates = loadTemplates(GLOBAL_DIR);
  const names = templates.map((t) => t.filename).sort();
  assert.deepEqual(names, ['architecture.md', 'design.md', 'domain.md']);
  for (const t of templates) {
    assert.match(t.content, /Placeholder/);
  }
});

test('scaffold: writes all templates into principles/ when none exist', (t) => {
  const dir = tmpDir(t);
  const result = scaffold(dir, GLOBAL_DIR);
  assert.deepEqual(result.skipped, []);
  assert.deepEqual(result.created.sort(), ['architecture.md', 'design.md', 'domain.md']);
  for (const f of result.created) {
    assert.ok(fs.existsSync(path.join(dir, 'principles', f)));
  }
});

test('scaffold: never overwrites an existing principles file by default', (t) => {
  const dir = tmpDir(t);
  fs.mkdirSync(path.join(dir, 'principles'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'principles', 'architecture.md'), 'REAL CONTENT, DO NOT CLOBBER');

  const result = scaffold(dir, GLOBAL_DIR);
  assert.ok(result.skipped.includes('architecture.md'));
  assert.ok(!result.created.includes('architecture.md'));
  assert.equal(fs.readFileSync(path.join(dir, 'principles', 'architecture.md'), 'utf8'), 'REAL CONTENT, DO NOT CLOBBER');
  // the other two still get created since they didn't exist yet
  assert.ok(result.created.includes('design.md'));
  assert.ok(result.created.includes('domain.md'));
});

test('scaffold: --force overwrites existing files', (t) => {
  const dir = tmpDir(t);
  fs.mkdirSync(path.join(dir, 'principles'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'principles', 'architecture.md'), 'stale content');

  const result = scaffold(dir, GLOBAL_DIR, { force: true });
  assert.ok(result.created.includes('architecture.md'));
  assert.match(fs.readFileSync(path.join(dir, 'principles', 'architecture.md'), 'utf8'), /Placeholder/);
});
