'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { writeTracked, makeReport, pruneEmptyDirs } = require('../lib/install');
const { sha256 } = require('../lib/manifest');

function tmpDir(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'toolkit-install-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

test('writeTracked: new file is created and recorded', (t) => {
  const dir = tmpDir(t);
  const filePath = path.join(dir, 'a', 'b.md');
  const report = makeReport();
  const manifestFiles = {};

  writeTracked(filePath, 'hello', sha256('source-v1'), manifestFiles, {}, report);

  assert.deepEqual(report.created, [filePath]);
  assert.equal(fs.readFileSync(filePath, 'utf8'), 'hello');
  assert.equal(manifestFiles[filePath].outputHash, sha256('hello'));
  assert.equal(manifestFiles[filePath].sourceHash, sha256('source-v1'));
});

test('writeTracked: dry run reports created but writes nothing', (t) => {
  const dir = tmpDir(t);
  const filePath = path.join(dir, 'a.md');
  const report = makeReport();
  const manifestFiles = {};

  writeTracked(filePath, 'hello', sha256('src'), manifestFiles, {}, report, { dryRun: true });

  assert.deepEqual(report.created, [filePath]);
  assert.equal(fs.existsSync(filePath), false);
});

test('writeTracked: unchanged file is a no-op', (t) => {
  const dir = tmpDir(t);
  const filePath = path.join(dir, 'a.md');
  fs.writeFileSync(filePath, 'hello');
  const prior = { [filePath]: { outputHash: sha256('hello'), sourceHash: sha256('src') } };
  const report = makeReport();
  const manifestFiles = {};

  writeTracked(filePath, 'hello', sha256('src'), manifestFiles, prior, report);

  assert.deepEqual(report.created, []);
  assert.deepEqual(report.updated, []);
});

test('writeTracked: source changed upstream, no local edit -> updates', (t) => {
  const dir = tmpDir(t);
  const filePath = path.join(dir, 'a.md');
  fs.writeFileSync(filePath, 'old content');
  const prior = { [filePath]: { outputHash: sha256('old content'), sourceHash: sha256('src-v1') } };
  const report = makeReport();
  const manifestFiles = {};

  writeTracked(filePath, 'new content', sha256('src-v2'), manifestFiles, prior, report);

  assert.deepEqual(report.updated, [filePath]);
  assert.equal(fs.readFileSync(filePath, 'utf8'), 'new content');
});

test('writeTracked: local edit, source unchanged upstream -> preserved, not overwritten', (t) => {
  const dir = tmpDir(t);
  const filePath = path.join(dir, 'a.md');
  fs.writeFileSync(filePath, 'hand-edited content');
  const prior = { [filePath]: { outputHash: sha256('original content'), sourceHash: sha256('src-v1') } };
  const report = makeReport();
  const manifestFiles = {};

  writeTracked(filePath, 'regenerated from same source', sha256('src-v1'), manifestFiles, prior, report);

  assert.deepEqual(report.localEditsPreserved, [filePath]);
  assert.deepEqual(report.conflicts, []);
  assert.equal(fs.readFileSync(filePath, 'utf8'), 'hand-edited content');
  assert.deepEqual(manifestFiles[filePath], prior[filePath]);
});

test('writeTracked: local edit AND source changed upstream -> conflict', (t) => {
  const dir = tmpDir(t);
  const filePath = path.join(dir, 'a.md');
  fs.writeFileSync(filePath, 'hand-edited content');
  const prior = { [filePath]: { outputHash: sha256('original content'), sourceHash: sha256('src-v1') } };
  const report = makeReport();
  const manifestFiles = {};

  writeTracked(filePath, 'regenerated from new source', sha256('src-v2'), manifestFiles, prior, report);

  assert.deepEqual(report.conflicts, [filePath]);
  assert.deepEqual(report.localEditsPreserved, []);
  assert.equal(fs.readFileSync(filePath, 'utf8'), 'hand-edited content');
});

test('writeTracked: pre-existing file with no manifest entry is treated as foreign', (t) => {
  const dir = tmpDir(t);
  const filePath = path.join(dir, 'a.md');
  fs.writeFileSync(filePath, 'not ours');
  const report = makeReport();
  const manifestFiles = {};

  writeTracked(filePath, 'toolkit content', sha256('src'), manifestFiles, {}, report);

  assert.deepEqual(report.skippedForeign, [filePath]);
  assert.equal(fs.readFileSync(filePath, 'utf8'), 'not ours');
  assert.equal(manifestFiles[filePath], undefined);
});

test('pruneEmptyDirs: removes empty directories up to but not including root', (t) => {
  const dir = tmpDir(t);
  const nested = path.join(dir, 'a', 'b', 'c');
  fs.mkdirSync(nested, { recursive: true });

  pruneEmptyDirs(nested, dir);

  assert.equal(fs.existsSync(path.join(dir, 'a')), false);
  assert.equal(fs.existsSync(dir), true);
});

test('pruneEmptyDirs: stops at a directory that still has content', (t) => {
  const dir = tmpDir(t);
  fs.mkdirSync(path.join(dir, 'a', 'b'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'a', 'keep.txt'), 'x');

  pruneEmptyDirs(path.join(dir, 'a', 'b'), dir);

  assert.equal(fs.existsSync(path.join(dir, 'a', 'b')), false);
  assert.equal(fs.existsSync(path.join(dir, 'a')), true);
  assert.equal(fs.existsSync(path.join(dir, 'a', 'keep.txt')), true);
});
