'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function sha256(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

function manifestPath(root) {
  return path.join(root, '.devtoolkit', 'manifest.json');
}

function load(root) {
  const p = manifestPath(root);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function save(root, manifest) {
  const p = manifestPath(root);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(manifest, null, 2) + '\n');
}

module.exports = { sha256, manifestPath, load, save };
