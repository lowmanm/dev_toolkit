'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { scan } = require('../lib/scan');

function makeFixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'toolkit-scan-'));
  return dir;
}

test('scan: empty repo reports nothing detected', (t) => {
  const dir = makeFixture();
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));

  const result = scan(dir);
  assert.deepEqual(result.stacks, []);
  assert.equal(result.testing.hasTestTooling, false);
  assert.equal(result.ci.present, false);
  assert.equal(result.codeowners, false);
  assert.equal(result.toolkit.manifest, null);
  assert.equal(result.code.hasSubstantialCode, false);
  assert.equal(result.code.fileCount, 0);
  for (const tool of Object.keys(result.toolkit.installed)) {
    assert.equal(result.toolkit.installed[tool].present, false);
  }
});

test('scan: a handful of small source files is not "substantial"', (t) => {
  const dir = makeFixture();
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));

  fs.writeFileSync(path.join(dir, 'index.js'), 'console.log("hi");\n');
  fs.writeFileSync(path.join(dir, 'util.js'), 'module.exports = {};\n');

  const result = scan(dir);
  assert.equal(result.code.hasSubstantialCode, false);
  assert.equal(result.code.fileCount, 2);
});

test('scan: enough source files and lines counts as substantial', (t) => {
  const dir = makeFixture();
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));

  const line = 'const x = 1;\n';
  for (const name of ['a.js', 'b.js', 'c.js', 'd.js']) {
    fs.writeFileSync(path.join(dir, name), line.repeat(60));
  }

  const result = scan(dir);
  assert.equal(result.code.hasSubstantialCode, true);
  assert.equal(result.code.fileCount, 4);
  assert.ok(result.code.lineCount >= 150);
});

test('scan: excludes node_modules and dotdirs from the code count', (t) => {
  const dir = makeFixture();
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));

  fs.mkdirSync(path.join(dir, 'node_modules', 'some-pkg'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'node_modules', 'some-pkg', 'index.js'), 'x'.repeat(5000));
  fs.mkdirSync(path.join(dir, '.git'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.git', 'huge.js'), 'x'.repeat(5000));

  const result = scan(dir);
  assert.equal(result.code.fileCount, 0);
  assert.equal(result.code.hasSubstantialCode, false);
});

test('scan: detects node stack via package.json test script', (t) => {
  const dir = makeFixture();
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));

  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'x', scripts: { test: 'jest' } }));

  const result = scan(dir);
  assert.deepEqual(result.stacks, ['node']);
  assert.equal(result.testing.hasTestTooling, true);
  assert.equal(result.testing.packageTestScript, 'jest');
});

test('scan: ignores package.json default "no test specified" placeholder', (t) => {
  const dir = makeFixture();
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));

  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({ name: 'x', scripts: { test: 'echo "Error: no test specified" && exit 1' } })
  );

  const result = scan(dir);
  assert.equal(result.testing.hasTestTooling, false);
  assert.equal(result.testing.packageTestScript, null);
});

test('scan: detects CI workflows and CODEOWNERS', (t) => {
  const dir = makeFixture();
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));

  fs.mkdirSync(path.join(dir, '.github', 'workflows'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.github', 'workflows', 'ci.yml'), 'name: CI\n');
  fs.writeFileSync(path.join(dir, 'CODEOWNERS'), '* @someone\n');

  const result = scan(dir);
  assert.equal(result.ci.present, true);
  assert.deepEqual(result.ci.workflowFiles, ['ci.yml']);
  assert.equal(result.codeowners, true);
});

test('scan: detects an existing toolkit install and its manifest', (t) => {
  const dir = makeFixture();
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));

  fs.mkdirSync(path.join(dir, '.claude', 'agents'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.claude', 'agents', 'dev.md'), 'stub');
  fs.mkdirSync(path.join(dir, '.devtoolkit'), { recursive: true });
  const manifest = { toolkitVersion: '0.1.0', scope: 'workspace', selection: { tools: ['claude'], agents: ['dev'], skills: [] }, files: {} };
  fs.writeFileSync(path.join(dir, '.devtoolkit', 'manifest.json'), JSON.stringify(manifest));

  const result = scan(dir);
  assert.equal(result.toolkit.installed.claude.present, true);
  assert.equal(result.toolkit.installed.copilot.present, false);
  assert.deepEqual(result.toolkit.manifest, manifest);
});
