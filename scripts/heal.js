#!/usr/bin/env node
/**
 * EAGLES AI Platform — Healing Script
 * Fixes MCP registration, tokens, and hooks. No Python dependency.
 * Usage: node scripts/heal.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const CLAUDE_JSON = path.join(os.homedir(), '.claude.json');
const CLAUDE_DIR = path.join(os.homedir(), '.claude');
const SETTINGS_JSON = path.join(CLAUDE_DIR, 'settings.json');
const HOOKS_DIR = path.join(CLAUDE_DIR, 'hooks');
const EAGLES_ROOT = 'C:/RH-OptimERP/eagles-ai-platform';
const MCPS_ROOT = 'C:/RH-OptimERP/MCPs';
const CONFIG_ROOT = path.resolve(__dirname, '..');

console.log('=========================================');
console.log('  EAGLES AI Platform — Heal');
console.log('  Fix MCPs + Token + Hooks');
console.log('=========================================\n');

// --- Step 1: Resolve GitHub token ---
console.log('[1/5] Resolving GitHub token...');
let ghToken = '';
try {
  ghToken = execSync('gh auth token', { encoding: 'utf-8', timeout: 10000 }).trim();
  console.log(`  OK — token resolved (${ghToken.substring(0, 8)}...)\n`);
} catch {
  console.log('  WARN — gh CLI not available. Run "gh auth login" first.');
  console.log('  Continuing without token (team-sync/github will not work)\n');
}

// --- Step 2: Register ALL MCPs in ~/.claude.json ---
console.log('[2/5] Registering MCP servers in ~/.claude.json...');

let config = {};
try {
  config = JSON.parse(fs.readFileSync(CLAUDE_JSON, 'utf-8'));
} catch {
  config = {};
}
if (!config.mcpServers) config.mcpServers = {};
const m = config.mcpServers;

// Core MCPs
m['filesystem'] = {
  command: 'npx',
  args: ['-y', '@modelcontextprotocol/server-filesystem', 'C:\\RH-OptimERP']
};

if (ghToken) {
  m['github'] = {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    env: { GITHUB_PERSONAL_ACCESS_TOKEN: ghToken }
  };
  m['team-sync'] = {
    type: 'stdio',
    command: 'node',
    args: [MCPS_ROOT + '/team-sync/scripts/launcher.js'],
    env: { GITHUB_TOKEN: ghToken }
  };
} else {
  // Register without token
  if (!m['team-sync']) {
    m['team-sync'] = {
      type: 'stdio',
      command: 'node',
      args: [MCPS_ROOT + '/team-sync/scripts/launcher.js'],
      env: {}
    };
  }
}

m['context7'] = { type: 'stdio', command: 'npx', args: ['-y', '@upstash/context7-mcp'] };
m['gitmcp'] = { type: 'http', url: 'https://gitmcp.io/docs' };
m['chrome-devtools'] = { type: 'stdio', command: 'npx', args: ['chrome-devtools-mcp@latest'], env: {} };

// MCPs from C:\RH-OptimERP\MCPs (if built)
const mcpMap = {
  'prompt-library': 'prompt-library-orchestrator',
  'qco': 'quality-code-orchestrator'
};
for (const [name, pkg] of Object.entries(mcpMap)) {
  const dist = path.join(MCPS_ROOT, pkg, 'dist', 'index.js');
  if (fs.existsSync(dist)) {
    m[name] = { type: 'stdio', command: 'node', args: [dist.replace(/\\/g, '/')], env: {} };
    console.log(`  + ${name}`);
  } else {
    console.log(`  - ${name} (not built: ${pkg}/dist/index.js missing)`);
  }
}

// EAGLES AI Platform MCPs (if built)
const eaglesMcps = {
  'token-tracker': 'token-tracker-mcp',
  'provider-router': 'provider-router-mcp',
  'vector-memory': 'vector-memory-mcp',
  'drift-detector': 'drift-detector-mcp',
  'verification': 'verification-mcp',
  'orchestrator': 'orchestrator-mcp',
};
const dataRoot = EAGLES_ROOT + '/.data';
for (const [name, pkg] of Object.entries(eaglesMcps)) {
  const dist = path.join(EAGLES_ROOT, 'packages', pkg, 'dist', 'index.js');
  if (fs.existsSync(dist)) {
    m[name] = {
      type: 'stdio',
      command: 'node',
      args: [dist.replace(/\\/g, '/')],
      env: { EAGLES_DATA_ROOT: dataRoot }
    };
    console.log(`  + ${name}`);
  } else {
    console.log(`  - ${name} (not built: ${pkg}/dist/index.js missing)`);
  }
}

fs.writeFileSync(CLAUDE_JSON, JSON.stringify(config, null, 2));
console.log(`  Registered ${Object.keys(m).length} MCPs total\n`);

// --- Step 3: Ensure directories ---
console.log('[3/5] Ensuring directories...');
for (const dir of [CLAUDE_DIR, HOOKS_DIR, path.join(CLAUDE_DIR, 'rules', 'common'), path.join(CLAUDE_DIR, 'rules', 'dotnet'), path.join(CLAUDE_DIR, 'agents')]) {
  fs.mkdirSync(dir, { recursive: true });
}
console.log('  OK\n');

// --- Step 4: Copy rules + agents ---
console.log('[4/5] Copying rules and agents...');

const rulesDirs = ['common', 'dotnet'];
let ruleCount = 0;
for (const dir of rulesDirs) {
  const src = path.join(CONFIG_ROOT, 'rules', dir);
  const dst = path.join(CLAUDE_DIR, 'rules', dir);
  if (fs.existsSync(src)) {
    for (const file of fs.readdirSync(src)) {
      fs.copyFileSync(path.join(src, file), path.join(dst, file));
      ruleCount++;
    }
  }
}
console.log(`  ${ruleCount} rules copied`);

const agentsSrc = path.join(CONFIG_ROOT, 'agents');
let agentCount = 0;
if (fs.existsSync(agentsSrc)) {
  const agentsDst = path.join(CLAUDE_DIR, 'agents');
  for (const file of fs.readdirSync(agentsSrc)) {
    const srcFile = path.join(agentsSrc, file);
    if (fs.statSync(srcFile).isFile()) {
      fs.copyFileSync(srcFile, path.join(agentsDst, file));
      agentCount++;
    }
  }
}
console.log(`  ${agentCount} agents copied\n`);

// --- Step 5: Copy hooks + wire settings.json ---
console.log('[5/5] Installing hooks...');

const hookFiles = ['cost-router.py', 'token-tracker-hook.py', 'skill-extractor.py', 'rate-limit-detector.py'];
for (const hook of hookFiles) {
  const src = path.join(CONFIG_ROOT, 'hooks', hook);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(HOOKS_DIR, hook));
    console.log(`  + ${hook}`);
  }
}

// Wire hooks in settings.json
let settings = {};
try {
  settings = JSON.parse(fs.readFileSync(SETTINGS_JSON, 'utf-8'));
} catch {
  settings = {};
}
if (!settings.hooks) settings.hooks = {};

// PreToolUse cost-router
const preHooks = settings.hooks.PreToolUse || [];
if (!preHooks.some(h => JSON.stringify(h).includes('cost-router'))) {
  preHooks.push({
    matcher: 'Agent',
    hooks: [{
      type: 'command',
      command: 'node -e "try{require(require(\'os\').homedir()+\'/.claude/hooks/cost-router.js\')}catch{}" 2>NUL || ver>NUL'
    }]
  });
  settings.hooks.PreToolUse = preHooks;
  console.log('  + PreToolUse cost-router hook');
}

// PostToolUse token-tracker
const postHooks = settings.hooks.PostToolUse || [];
if (!postHooks.some(h => JSON.stringify(h).includes('token-tracker'))) {
  postHooks.push({
    matcher: 'Agent|Read|Edit|Write|Bash|Grep|Glob|WebFetch|WebSearch|TodoWrite|ToolSearch|mcp__.*',
    hooks: [{
      type: 'command',
      command: 'node -e "try{require(require(\'os\').homedir()+\'/.claude/hooks/token-tracker-hook.js\')}catch{}" 2>NUL || ver>NUL'
    }]
  });
  settings.hooks.PostToolUse = postHooks;
  console.log('  + PostToolUse token-tracker hook');
}

fs.writeFileSync(SETTINGS_JSON, JSON.stringify(settings, null, 2));
console.log('');

// --- Summary ---
console.log('=========================================');
console.log('  Heal complete!');
console.log(`  ${Object.keys(m).length} MCPs | ${ruleCount} rules | ${agentCount} agents`);
console.log(`  Token: ${ghToken ? 'YES' : 'MISSING (run gh auth login)'}`);
console.log('');
console.log('  → Restart VS Code to activate');
console.log('=========================================');
