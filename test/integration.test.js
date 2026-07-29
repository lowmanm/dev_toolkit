'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TOOLKIT_BIN = path.join(__dirname, '..', 'bin', 'toolkit');

function run(args, cwd) {
  return spawnSync(process.execPath, [TOOLKIT_BIN, ...args], { cwd, encoding: 'utf8' });
}

function tmpDir(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'toolkit-e2e-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

test('--help exits 0 and prints usage', (t) => {
  const dir = tmpDir(t);
  const result = run(['--help'], dir);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage:/);
});

test('unrecognized flag exits non-zero with a clean message, no stack trace noise for the user', (t) => {
  const dir = tmpDir(t);
  const result = run(['--bogus'], dir);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Unrecognized argument: --bogus/);
});

test('full lifecycle: install -> no-op update -> conflict detection -> status -> uninstall', (t) => {
  const dir = tmpDir(t);

  const install = run(['--yes', '--scope=workspace'], dir);
  assert.equal(install.status, 0);
  assert.match(install.stdout, /Installed dev_toolkit/);
  assert.ok(fs.existsSync(path.join(dir, '.github', 'agents', 'dev.agent.md')));
  assert.ok(fs.existsSync(path.join(dir, '.claude', 'agents', 'dev.md')));
  assert.ok(fs.existsSync(path.join(dir, '.gemini', 'agents', 'dev.md')));
  assert.ok(fs.existsSync(path.join(dir, 'CLAUDE.md')));
  assert.ok(fs.existsSync(path.join(dir, 'GEMINI.md')));
  assert.ok(fs.existsSync(path.join(dir, '.devtoolkit', 'manifest.json')));

  const reupdate = run(['--yes'], dir);
  assert.equal(reupdate.status, 0);
  assert.match(reupdate.stdout, /Updated dev_toolkit/);
  assert.match(reupdate.stdout, /created: 0, updated: 0/);

  const skillFile = path.join(dir, '.claude', 'skills', 'pr-review', 'SKILL.md');
  fs.appendFileSync(skillFile, '\nLocal note.\n');

  const statusAfterEdit = run(['status'], dir);
  assert.equal(statusAfterEdit.status, 0);
  assert.match(statusAfterEdit.stdout, /local edit\(s\) preserved/);
  assert.equal(fs.readFileSync(skillFile, 'utf8').includes('Local note.'), true);

  const uninstall = run(['uninstall', '--yes'], dir);
  assert.equal(uninstall.status, 0);
  assert.match(uninstall.stdout, /Removed dev_toolkit/);
  assert.equal(fs.existsSync(skillFile), true, 'locally edited file should survive uninstall');
  assert.equal(fs.existsSync(path.join(dir, '.devtoolkit')), false);
  assert.equal(fs.existsSync(path.join(dir, '.github', 'agents')), false);
});

test('status before any install errors clearly', (t) => {
  const dir = tmpDir(t);
  const result = run(['status'], dir);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /No toolkit install found/);
});

test('--dry-run does not write anything', (t) => {
  const dir = tmpDir(t);
  const result = run(['--yes', '--dry-run'], dir);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /\[dry run\] Would install/);
  assert.equal(fs.existsSync(path.join(dir, '.github')), false);
});

test('scan --json reports an empty repo accurately', (t) => {
  const dir = tmpDir(t);
  const result = run(['scan', '--json'], dir);
  assert.equal(result.status, 0);
  const parsed = JSON.parse(result.stdout);
  assert.deepEqual(parsed.stacks, []);
  assert.equal(parsed.toolkit.manifest, null);
});

test('selective install: only requested tool/agent/skill are written', (t) => {
  const dir = tmpDir(t);
  const result = run(['--yes', '--tools=claude', '--agents=dev', '--skills=pr-review'], dir);
  assert.equal(result.status, 0);
  assert.equal(fs.existsSync(path.join(dir, '.claude', 'agents', 'dev.md')), true);
  assert.equal(fs.existsSync(path.join(dir, '.claude', 'agents', 'tester.md')), false);
  assert.equal(fs.existsSync(path.join(dir, '.claude', 'skills', 'testing-unit')), false);
  assert.equal(fs.existsSync(path.join(dir, '.github')), false);
  assert.equal(fs.existsSync(path.join(dir, '.gemini')), false);
});
