'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const manifestLib = require('../lib/manifest');

test('sha256: deterministic and content-sensitive', () => {
  const a = manifestLib.sha256('hello');
  const b = manifestLib.sha256('hello');
  const c = manifestLib.sha256('hello!');
  assert.equal(a, b);
  assert.notEqual(a, c);
});

test('load: returns null when no manifest exists', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'toolkit-manifest-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  assert.equal(manifestLib.load(dir), null);
});

test('save/load: round-trips', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'toolkit-manifest-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));

  const data = {
    toolkitVersion: '0.1.0',
    scope: 'workspace',
    selection: { tools: ['claude'], agents: ['dev'], skills: ['pr-review'] },
    files: { '/tmp/x': { outputHash: 'abc', sourceHash: 'def' } },
  };
  manifestLib.save(dir, data);
  assert.ok(fs.existsSync(manifestLib.manifestPath(dir)));

  const loaded = manifestLib.load(dir);
  assert.deepEqual(loaded, data);
});
