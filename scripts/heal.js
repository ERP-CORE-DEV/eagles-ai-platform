#!/usr/bin/env node
/**
 * EAGLES AI Platform — Healing Script
 * Builds everything, registers MCPs, injects tokens, copies hooks.
 * Pure Node.js — no Python dependency.
 *
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

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'], timeout: 300000, ...opts }).trim();
  } catch (e) {
    return null;
  }
}

console.log('=========================================');
console.log('  EAGLES AI Platform — Heal');
console.log('  Build + MCPs + Token + Hooks');
console.log('=========================================\n');

// --- Step 1: Resolve GitHub token ---
console.log('[1/7] Resolving GitHub token...');
let ghToken = '';
try {
  ghToken = execSync('gh auth token', { encoding: 'utf-8', timeout: 10000 }).trim();
  console.log(`  OK — token resolved (${ghToken.substring(0, 8)}...)\n`);
} catch {
  console.log('  WARN — gh CLI not available. Run "gh auth login" first.');
  console.log('  Continuing without token (team-sync/github will not work)\n');
}

// --- Step 2: Install pnpm if missing ---
console.log('[2/7] Checking pnpm...');
if (run('pnpm --version')) {
  console.log(`  OK — pnpm ${run('pnpm --version')}\n`);
} else {
  console.log('  Installing pnpm...');
  run('npm install -g pnpm');
  console.log(`  OK — pnpm installed\n`);
}

// --- Step 3: Build EAGLES AI Platform ---
console.log('[3/7] Building EAGLES AI Platform...');
if (fs.existsSync(EAGLES_ROOT)) {
  // Create data directories
  const dataDirs = ['token-ledger', 'vector-memory', 'drift-detector', 'provider-router', 'verification', 'orchestrator', 'events'];
  for (const dir of dataDirs) {
    fs.mkdirSync(path.join(EAGLES_ROOT, '.data', dir), { recursive: true });
  }

  // Pull latest
  console.log('  Pulling latest...');
  run('git fetch origin main && git reset --hard origin/main', { cwd: EAGLES_ROOT });

  console.log('  Installing dependencies...');
  const installOut = run('pnpm install', { cwd: EAGLES_ROOT });
  if (installOut === null) {
    console.log('  WARN — pnpm install failed. Trying npm...');
    run('npm install', { cwd: EAGLES_ROOT });
  }

  console.log('  Building packages...');
  const buildResult = run('pnpm run build:ordered', { cwd: EAGLES_ROOT });
  if (buildResult !== null) {
    console.log('  OK — all packages built');
  } else {
    console.log('  WARN — pnpm build failed. Trying npm...');
    run('npm run build:ordered', { cwd: EAGLES_ROOT });
  }

  // Verify builds
  let builtCount = 0;
  for (const pkg of ['token-tracker-mcp', 'provider-router-mcp', 'vector-memory-mcp', 'drift-detector-mcp', 'verification-mcp', 'orchestrator-mcp']) {
    const dist = path.join(EAGLES_ROOT, 'packages', pkg, 'dist', 'index.js');
    if (fs.existsSync(dist)) builtCount++;
    else console.log(`  MISSING: ${pkg}/dist/index.js`);
  }
  console.log(`  ${builtCount}/6 EAGLES packages built\n`);
} else {
  console.log(`  SKIP — ${EAGLES_ROOT} not found`);
  console.log('  Run: git clone https://github.com/ERP-CORE-DEV/eagles-ai-platform.git C:/RH-OptimERP/eagles-ai-platform');
  console.log('  Then re-run: node scripts/heal.js\n');
}

// --- Step 4: Build RH-OptimERP MCPs ---
console.log('[4/7] Building RH-OptimERP MCPs...');
const mcpsToBuild = ['team-sync', 'prompt-library-orchestrator', 'quality-code-orchestrator'];
for (const mcp of mcpsToBuild) {
  const mcpPath = path.join(MCPS_ROOT, mcp);
  if (fs.existsSync(mcpPath)) {
    const distExists = fs.existsSync(path.join(mcpPath, 'dist', 'index.js'));
    if (!distExists) {
      console.log(`  ${mcp} — installing + building...`);
      run('npm install --silent', { cwd: mcpPath });
      run('npm run build --silent', { cwd: mcpPath });
    }
    console.log(`  + ${mcp}`);
  } else {
    console.log(`  - ${mcp} (not found)`);
  }
}
console.log('');

// --- Step 5: Globally install MCP packages (npx is unreliable on Windows) ---
console.log('[5/7] Installing MCP packages globally...');
const npmPackages = [
  '@modelcontextprotocol/server-filesystem',
  '@modelcontextprotocol/server-github',
  '@upstash/context7-mcp',
  'chrome-devtools-mcp'
];
console.log(`  npm install -g ${npmPackages.join(' ')}...`);
const installResult = run(`npm install -g ${npmPackages.join(' ')}`, { timeout: 120000 });
if (installResult !== null) {
  console.log('  OK\n');
} else {
  console.log('  WARN — some packages may have failed to install\n');
}

// --- Step 6: Register ALL MCPs in ~/.claude.json ---
console.log('[6/7] Registering MCP servers in ~/.claude.json...');

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
}

m['team-sync'] = {
  type: 'stdio',
  command: 'node',
  args: [MCPS_ROOT + '/team-sync/scripts/launcher.js'],
  env: ghToken ? { GITHUB_TOKEN: ghToken } : {}
};

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
    console.log(`  - ${name} (not built)`);
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
    console.log(`  - ${name} (not built)`);
  }
}

fs.writeFileSync(CLAUDE_JSON, JSON.stringify(config, null, 2));
const totalMcps = Object.keys(m).length;
console.log(`  Registered ${totalMcps} MCPs total\n`);

// --- Step 7: Ensure dirs + Copy rules/agents + Hooks ---
console.log('[7/7] Installing rules, agents, hooks...');

// Ensure directories
for (const dir of [CLAUDE_DIR, HOOKS_DIR, path.join(CLAUDE_DIR, 'rules', 'common'), path.join(CLAUDE_DIR, 'rules', 'dotnet'), path.join(CLAUDE_DIR, 'agents')]) {
  fs.mkdirSync(dir, { recursive: true });
}

// Copy rules
const rulesDirs = ['common', 'dotnet'];
let ruleCount = 0;
for (const dir of rulesDirs) {
  const src = path.join(CONFIG_ROOT, 'rules', dir);
  const dst = path.join(CLAUDE_DIR, 'rules', dir);
  if (fs.existsSync(src)) {
    for (const file of fs.readdirSync(src)) {
      if (fs.statSync(path.join(src, file)).isFile()) {
        fs.copyFileSync(path.join(src, file), path.join(dst, file));
        ruleCount++;
      }
    }
  }
}

// Copy agents
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

// Copy hooks
const hookFiles = ['cost-router.py', 'token-tracker-hook.py', 'skill-extractor.py', 'rate-limit-detector.py'];
let hookCount = 0;
for (const hook of hookFiles) {
  const src = path.join(CONFIG_ROOT, 'hooks', hook);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(HOOKS_DIR, hook));
    hookCount++;
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

const preHooks = settings.hooks.PreToolUse || [];
if (!preHooks.some(h => JSON.stringify(h).includes('cost-router'))) {
  preHooks.push({
    matcher: 'Agent',
    hooks: [{ type: 'command', command: 'node -e "try{require(require(\'os\').homedir()+\'/.claude/hooks/cost-router.js\')}catch{}" 2>NUL || ver>NUL' }]
  });
  settings.hooks.PreToolUse = preHooks;
}

const postHooks = settings.hooks.PostToolUse || [];
if (!postHooks.some(h => JSON.stringify(h).includes('token-tracker'))) {
  postHooks.push({
    matcher: 'Agent|Read|Edit|Write|Bash|Grep|Glob|WebFetch|WebSearch|TodoWrite|ToolSearch|mcp__.*',
    hooks: [{ type: 'command', command: 'node -e "try{require(require(\'os\').homedir()+\'/.claude/hooks/token-tracker-hook.js\')}catch{}" 2>NUL || ver>NUL' }]
  });
  settings.hooks.PostToolUse = postHooks;
}

fs.writeFileSync(SETTINGS_JSON, JSON.stringify(settings, null, 2));
console.log(`  ${ruleCount} rules | ${agentCount} agents | ${hookCount} hooks\n`);

// --- Summary ---
console.log('=========================================');
console.log('  Heal complete!');
console.log('');
console.log(`  MCPs:    ${totalMcps} registered`);
console.log(`  Token:   ${ghToken ? 'YES' : 'MISSING (run gh auth login)'}`);
console.log(`  Rules:   ${ruleCount}`);
console.log(`  Agents:  ${agentCount}`);
console.log(`  Hooks:   ${hookCount}`);
console.log('');
console.log('  → Restart VS Code to activate');
console.log('=========================================');
