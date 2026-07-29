'use strict';

const fs = require('fs');
const path = require('path');
const manifestLib = require('./manifest');

function makeReport() {
  return { created: [], updated: [], conflicts: [], localEditsPreserved: [], skippedForeign: [] };
}

// Writes `content` to `filePath`, respecting manifest-recorded checksums so a
// locally hand-edited file is never silently clobbered. Distinguishes a
// harmless local edit (source unchanged upstream) from a real conflict
// (local edit AND the org source moved), so updates never silently drop
// either side. With { dryRun: true }, computes and reports the same outcome
// without touching the filesystem.
function writeTracked(filePath, content, sourceHash, manifestFiles, previousManifestFiles, report, { dryRun = false } = {}) {
  const outputHash = manifestLib.sha256(content);
  const prior = previousManifestFiles && previousManifestFiles[filePath];
  const existsOnDisk = fs.existsSync(filePath);

  if (existsOnDisk) {
    const onDisk = fs.readFileSync(filePath, 'utf8');
    const onDiskHash = manifestLib.sha256(onDisk);
    if (prior && onDiskHash !== prior.outputHash) {
      const sourceChanged = prior.sourceHash !== sourceHash;
      report[sourceChanged ? 'conflicts' : 'localEditsPreserved'].push(filePath);
      manifestFiles[filePath] = prior; // keep tracking the last-known-synced state
      return;
    }
    if (!prior) {
      // File exists but the toolkit never wrote it (foreign file) — don't overwrite.
      report.skippedForeign.push(filePath);
      return;
    }
    if (onDiskHash === outputHash) {
      manifestFiles[filePath] = { outputHash, sourceHash };
      return; // already up to date
    }
  }

  if (!dryRun) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
  }
  manifestFiles[filePath] = { outputHash, sourceHash };
  report[existsOnDisk ? 'updated' : 'created'].push(filePath);
}

// Removes empty directories from `dir` upward, stopping at (and never
// deleting) `root`. Used by uninstall to clean up after itself without
// touching anything the toolkit didn't create.
function pruneEmptyDirs(dir, root) {
  const resolvedRoot = path.resolve(root);
  let current = path.resolve(dir);
  while (current !== resolvedRoot && current.startsWith(resolvedRoot + path.sep)) {
    let entries;
    try {
      entries = fs.readdirSync(current);
    } catch {
      return;
    }
    if (entries.length > 0) return;
    fs.rmdirSync(current);
    current = path.dirname(current);
  }
}

module.exports = { makeReport, writeTracked, pruneEmptyDirs };
