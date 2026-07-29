'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { parseArgs, splitList } = require('../lib/cli');

test('splitList: trims and drops empties', () => {
  assert.deepEqual(splitList('a, b ,,c'), ['a', 'b', 'c']);
});

test('parseArgs: defaults', () => {
  const args = parseArgs([]);
  assert.equal(args.scope, null);
  assert.equal(args.yes, false);
  assert.equal(args.dryRun, false);
  assert.equal(args.help, false);
});

test('parseArgs: flags parsed correctly', () => {
  const args = parseArgs(['--scope=user', '--tools=claude,gemini', '--agents=dev', '--skills=pr-review,testing-unit', '--dry-run', '--yes']);
  assert.equal(args.scope, 'user');
  assert.deepEqual(args.tools, ['claude', 'gemini']);
  assert.deepEqual(args.agents, ['dev']);
  assert.deepEqual(args.skills, ['pr-review', 'testing-unit']);
  assert.equal(args.dryRun, true);
  assert.equal(args.yes, true);
});

test('parseArgs: --help / -h sets help', () => {
  assert.equal(parseArgs(['--help']).help, true);
  assert.equal(parseArgs(['-h']).help, true);
});

test('parseArgs: unrecognized flag throws instead of killing the process', () => {
  assert.throws(() => parseArgs(['--bogus']), /Unrecognized argument: --bogus/);
});
