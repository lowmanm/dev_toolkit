'use strict';

const fs = require('fs');
const path = require('path');

// Deterministic repo inspection used by `bin/toolkit scan` and the
// `repo-init` agent, so "what's already here" is computed once from real
// filesystem state instead of re-derived by an LLM grepping around each run.

const TOOLKIT_LAYOUT = {
  copilot: { agents: '.github/agents', skills: '.github/skills', instructions: '.github/copilot-instructions.md' },
  claude: { agents: '.claude/agents', skills: '.claude/skills', instructions: 'CLAUDE.md' },
  gemini: { agents: '.gemini/agents', skills: '.gemini/skills', instructions: 'GEMINI.md' },
};

const PACKAGE_MANIFESTS = [
  { file: 'package.json', stack: 'node' },
  { file: 'requirements.txt', stack: 'python' },
  { file: 'pyproject.toml', stack: 'python' },
  { file: 'go.mod', stack: 'go' },
  { file: 'Gemfile', stack: 'ruby' },
  { file: 'pom.xml', stack: 'java' },
  { file: 'build.gradle', stack: 'java' },
  { file: 'build.gradle.kts', stack: 'java' },
  { file: 'Cargo.toml', stack: 'rust' },
  { file: 'composer.json', stack: 'php' },
];

const TEST_CONFIG_SIGNALS = [
  'jest.config.js',
  'jest.config.ts',
  'jest.config.cjs',
  'jest.config.mjs',
  'vitest.config.js',
  'vitest.config.ts',
  '.mocharc.json',
  '.mocharc.js',
  '.mocharc.yml',
  'pytest.ini',
  'tox.ini',
  'phpunit.xml',
  'phpunit.xml.dist',
  'karma.conf.js',
];

const CI_SIGNALS = ['.github/workflows', '.gitlab-ci.yml', '.circleci/config.yml', 'azure-pipelines.yml', 'Jenkinsfile', '.drone.yml'];

function exists(root, rel) {
  return fs.existsSync(path.join(root, rel));
}

function listDir(root, rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p) || !fs.statSync(p).isDirectory()) return [];
  return fs.readdirSync(p);
}

function detectToolkitInstalls(root) {
  const result = {};
  for (const [tool, layout] of Object.entries(TOOLKIT_LAYOUT)) {
    const agents = listDir(root, layout.agents);
    const skills = listDir(root, layout.skills);
    const hasInstructions = exists(root, layout.instructions);
    result[tool] = { present: agents.length > 0 || skills.length > 0 || hasInstructions, agents, skills, hasInstructions };
  }
  return result;
}

function detectManifest(root) {
  const manifestPath = path.join(root, '.devtoolkit', 'manifest.json');
  if (!fs.existsSync(manifestPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch {
    return { parseError: true, path: manifestPath };
  }
}

function detectStacks(root) {
  const stacks = PACKAGE_MANIFESTS.filter((m) => exists(root, m.file)).map((m) => m.stack);
  return [...new Set(stacks)];
}

function detectPackageJsonTestScript(root) {
  const p = path.join(root, 'package.json');
  if (!fs.existsSync(p)) return null;
  try {
    const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
    const script = pkg.scripts && pkg.scripts.test;
    if (!script || /no test specified/i.test(script)) return null;
    return script;
  } catch {
    return null;
  }
}

function detectTesting(root) {
  const configSignals = TEST_CONFIG_SIGNALS.filter((f) => exists(root, f));
  const packageTestScript = detectPackageJsonTestScript(root);
  return { hasTestTooling: configSignals.length > 0 || Boolean(packageTestScript), configSignals, packageTestScript };
}

function detectCI(root) {
  const present = CI_SIGNALS.filter((f) => exists(root, f));
  const workflowFiles = present.includes('.github/workflows')
    ? listDir(root, '.github/workflows').filter((f) => /\.ya?ml$/.test(f))
    : [];
  return { present: present.length > 0, signals: present, workflowFiles };
}

function scan(root) {
  return {
    root,
    toolkit: { installed: detectToolkitInstalls(root), manifest: detectManifest(root) },
    stacks: detectStacks(root),
    testing: detectTesting(root),
    ci: detectCI(root),
    codeowners: exists(root, 'CODEOWNERS') || exists(root, '.github/CODEOWNERS'),
  };
}

module.exports = { scan };
