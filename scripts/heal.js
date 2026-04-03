#!/usr/bin/env node
/**
 * EAGLES AI Platform — Deep Healing Script
 * Fixes EVERYTHING: build tools, native deps, MCPs, tokens, hooks.
 * Pure Node.js — no Python dependency.
 *
 * Usage (Git Bash): node scripts/heal.js
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

let errors = [];

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 600000,
      ...opts
    }).trim();
  } catch (e) {
    return null;
  }
}

function runVerbose(cmd, label, opts = {}) {
  try {
    execSync(cmd, {
      encoding: 'utf-8',
      stdio: 'inherit',
      timeout: 600000,
      ...opts
    });
    return true;
  } catch (e) {
    errors.push(`${label}: ${e.message?.split('\n')[0] || 'failed'}`);
    return false;
  }
}

console.log('=============================================');
console.log('  EAGLES AI Platform — Deep Heal');
console.log('  Build Tools + Native Deps + MCPs + Token');
console.log('=============================================\n');

// ============================================================
// Step 1: GitHub token
// ============================================================
console.log('[1/9] Resolving GitHub token...');
let ghToken = '';
try {
  ghToken = execSync('gh auth token', { encoding: 'utf-8', timeout: 10000 }).trim();
  console.log(`  OK — ${ghToken.substring(0, 8)}...\n`);
} catch {
  console.log('  WARN — run "gh auth login" first\n');
}

// ============================================================
// Step 2: Ensure C++ build tools + native deps
// ============================================================
console.log('[2/9] Checking C++ build tools and native dependencies...');
let nativeOk = false;

// Check if better-sqlite3 already works
if (fs.existsSync(EAGLES_ROOT)) {
  try {
    execSync('node -e "require(\'better-sqlite3\')"', {
      cwd: EAGLES_ROOT,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    nativeOk = true;
    console.log('  better-sqlite3: OK');
  } catch (e) {
    console.log('  better-sqlite3: not working');
    console.log(`  Error: ${(e.stderr || e.message || '').toString().split('\n')[0]}`);
  }
} else {
  console.log('  eagles-ai-platform not found yet (will clone in Step 4)');
}

// Check if cl.exe (MSVC compiler) is available
const hasCl = run('where.exe cl') || run('cmd /c "where cl"');
if (hasCl) {
  console.log('  C++ compiler: found');
} else {
  console.log('  C++ compiler: NOT FOUND — installing Visual Studio Build Tools...');

  // Try winget first
  const wingetResult = run('winget install Microsoft.VisualStudio.2022.BuildTools --override "--add Microsoft.VisualStudio.Workload.VCTools --includeRecommended --passive --wait" --accept-package-agreements --accept-source-agreements', { timeout: 600000 });
  if (wingetResult !== null) {
    console.log('  Visual Studio Build Tools installed via winget');
  } else {
    // Try modifying existing install
    const vsInstallerPaths = [
      process.env['ProgramFiles(x86)'] + '\\Microsoft Visual Studio\\Installer\\vs_installer.exe',
      'C:\\Program Files (x86)\\Microsoft Visual Studio\\Installer\\vs_installer.exe'
    ];
    let installed = false;
    for (const vsi of vsInstallerPaths) {
      if (fs.existsSync(vsi)) {
        console.log('  Found VS Installer, adding C++ workload...');
        run(`"${vsi}" modify --installPath "${process.env['ProgramFiles(x86)']}\\Microsoft Visual Studio\\2022\\BuildTools" --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended --passive --wait`, { timeout: 600000 });
        installed = true;
        break;
      }
    }

    // Last resort: use the already-downloaded vs_BuildTools.exe
    if (!installed) {
      const homeDirs = [os.homedir()];
      for (const home of homeDirs) {
        const exe = path.join(home, '.windows-build-tools', 'vs_BuildTools.exe');
        if (fs.existsSync(exe)) {
          console.log(`  Running ${exe} with C++ workload...`);
          run(`"${exe}" --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended --passive --wait`, { timeout: 600000 });
          installed = true;
          break;
        }
      }
    }

    if (!installed) {
      console.log('  WARN — could not auto-install. Manual install needed:');
      console.log('    1. Download: https://visualstudio.microsoft.com/visual-cpp-build-tools/');
      console.log('    2. Select "Desktop development with C++"');
      console.log('    3. Re-run: node scripts/heal.js');
      errors.push('C++ build tools not installed');
    }
  }
}
console.log('');

// ============================================================
// Step 3: pnpm
// ============================================================
console.log('[3/9] Checking pnpm...');
if (run('pnpm --version')) {
  console.log(`  OK — pnpm ${run('pnpm --version')}\n`);
} else {
  console.log('  Installing pnpm...');
  run('npm install -g pnpm');
  console.log('  OK\n');
}

// ============================================================
// Step 4: Clone/pull repos
// ============================================================
console.log('[4/9] Syncing repositories...');
const repos = {
  'eagles-ai-platform': 'https://github.com/ERP-CORE-DEV/eagles-ai-platform.git',
};
for (const [name, url] of Object.entries(repos)) {
  const repoPath = `C:/RH-OptimERP/${name}`;
  if (fs.existsSync(repoPath)) {
    console.log(`  ${name}: pulling...`);
    run('git fetch origin main && git reset --hard origin/main', { cwd: repoPath });
  } else {
    console.log(`  ${name}: cloning...`);
    run(`git clone ${url} ${repoPath}`);
  }
}
// MCPs repo
if (fs.existsSync(path.join(MCPS_ROOT, 'team-sync'))) {
  console.log('  MCPs/team-sync: pulling...');
  run('git fetch origin main && git reset --hard origin/main', { cwd: path.join(MCPS_ROOT, 'team-sync') });
} else if (!fs.existsSync(MCPS_ROOT)) {
  console.log('  MCPs: cloning...');
  run(`git clone https://github.com/ERP-CORE-DEV/rh-optimerp-mcps.git ${MCPS_ROOT}`);
}
console.log('  OK\n');

// ============================================================
// Step 5: Build EAGLES AI Platform + fix native deps
// ============================================================
console.log('[5/9] Building EAGLES AI Platform...');
if (fs.existsSync(EAGLES_ROOT)) {
  // Data directories
  for (const dir of ['token-ledger', 'vector-memory', 'drift-detector', 'provider-router', 'verification', 'orchestrator', 'events']) {
    fs.mkdirSync(path.join(EAGLES_ROOT, '.data', dir), { recursive: true });
  }

  console.log('  pnpm install...');
  runVerbose('pnpm install', 'pnpm install', { cwd: EAGLES_ROOT });

  // Fix native deps if broken — ALWAYS inject prebuilt first, then try rebuild
  if (!nativeOk) {
    console.log('  Fixing native deps...');

    // Inject prebuilt binaries from eagles-claude-config/prebuilt/
    console.log('  Injecting prebuilt binaries (Node v24.12.0 x64 win32)...');
    const prebuiltDir = path.join(CONFIG_ROOT, 'prebuilt');

    function findPkgDirs(baseDir, pkgName) {
      const results = [];
      try {
        const pnpmDir = path.join(baseDir, 'node_modules', '.pnpm');
        if (!fs.existsSync(pnpmDir)) return results;
        for (const entry of fs.readdirSync(pnpmDir)) {
          if (entry.startsWith(pkgName + '@')) {
            const target = path.join(pnpmDir, entry, 'node_modules', pkgName);
            if (fs.existsSync(target)) results.push(target);
          }
        }
      } catch {}
      return results;
    }

    const nativePkgs = [
      { name: 'better-sqlite3', file: 'better_sqlite3.node' },
      { name: 'hnswlib-node', file: 'addon.node' }
    ];

    for (const { name, file } of nativePkgs) {
      const prebuiltFile = path.join(prebuiltDir, name, 'Release', file);
      if (!fs.existsSync(prebuiltFile)) {
        console.log(`  - ${name}: no prebuilt binary in ${path.relative(process.cwd(), prebuiltFile)}`);
        continue;
      }

      const pkgDirs = findPkgDirs(EAGLES_ROOT, name);
      console.log(`  ${name}: found ${pkgDirs.length} location(s) in node_modules`);

      if (pkgDirs.length === 0) {
        console.log(`  - ${name}: not in node_modules — pnpm install may have failed`);
        continue;
      }

      for (const pkgDir of pkgDirs) {
        const targetDir = path.join(pkgDir, 'build', 'Release');
        fs.mkdirSync(targetDir, { recursive: true });
        fs.copyFileSync(prebuiltFile, path.join(targetDir, file));
        console.log(`  + ${name} → ${path.relative(EAGLES_ROOT, path.join(targetDir, file))}`);
      }
    }

    // Also try pnpm rebuild as backup (if C++ tools were just installed)
    run('pnpm rebuild better-sqlite3 2>/dev/null', { cwd: EAGLES_ROOT });
    run('pnpm rebuild hnswlib-node 2>/dev/null', { cwd: EAGLES_ROOT });

    // Verify
    try {
      execSync('node -e "require(\'better-sqlite3\')"', { cwd: EAGLES_ROOT, stdio: ['pipe', 'pipe', 'pipe'] });
      nativeOk = true;
      console.log('  better-sqlite3: OK ✓');
    } catch (e) {
      const errMsg = (e.stderr || e.message || '').toString().split('\n').slice(0, 3).join('\n    ');
      errors.push('better-sqlite3 broken after injection');
      console.log('  FAIL — better-sqlite3 still broken:');
      console.log(`    ${errMsg}`);
    }
  }

  console.log('  Building packages...');
  runVerbose('pnpm run build:ordered', 'pnpm build:ordered', { cwd: EAGLES_ROOT });

  // Verify builds
  let built = 0;
  for (const pkg of ['token-tracker-mcp', 'provider-router-mcp', 'vector-memory-mcp', 'drift-detector-mcp', 'verification-mcp', 'orchestrator-mcp']) {
    const dist = path.join(EAGLES_ROOT, 'packages', pkg, 'dist', 'index.js');
    if (fs.existsSync(dist)) { built++; }
    else { console.log(`  MISSING: ${pkg}/dist/index.js`); }
  }
  console.log(`  ${built}/6 EAGLES packages built\n`);
} else {
  console.log(`  FATAL — ${EAGLES_ROOT} not found after clone attempt\n`);
  errors.push('eagles-ai-platform directory missing');
}

// ============================================================
// Step 6: Build RH-OptimERP MCPs
// ============================================================
console.log('[6/9] Building RH-OptimERP MCPs...');
for (const mcp of ['team-sync', 'prompt-library-orchestrator', 'quality-code-orchestrator']) {
  const mcpPath = path.join(MCPS_ROOT, mcp);
  if (fs.existsSync(mcpPath)) {
    if (!fs.existsSync(path.join(mcpPath, 'dist', 'index.js'))) {
      console.log(`  ${mcp}: building...`);
      run('npm install --silent', { cwd: mcpPath });
      run('npm run build --silent', { cwd: mcpPath });
    }
    console.log(`  + ${mcp}`);
  } else {
    console.log(`  - ${mcp} (not found)`);
  }
}
console.log('');

// ============================================================
// Step 7: Install global npx MCP packages
// ============================================================
console.log('[7/9] Installing MCP packages globally...');
const npmPkgs = '@modelcontextprotocol/server-filesystem @modelcontextprotocol/server-github @upstash/context7-mcp chrome-devtools-mcp';
console.log(`  npm install -g ...`);
run(`npm install -g ${npmPkgs}`, { timeout: 120000 });
console.log('  OK\n');

// ============================================================
// Step 8: Register ALL MCPs in ~/.claude.json
// ============================================================
console.log('[8/9] Registering MCP servers...');

let config = {};
try { config = JSON.parse(fs.readFileSync(CLAUDE_JSON, 'utf-8')); } catch { config = {}; }
if (!config.mcpServers) config.mcpServers = {};
const m = config.mcpServers;

// Core MCPs
m['filesystem'] = { command: 'npx', args: ['-y', '@modelcontextprotocol/server-filesystem', 'C:\\RH-OptimERP'] };
m['context7'] = { type: 'stdio', command: 'npx', args: ['-y', '@upstash/context7-mcp'] };
m['gitmcp'] = { type: 'http', url: 'https://gitmcp.io/docs' };
m['chrome-devtools'] = { type: 'stdio', command: 'npx', args: ['chrome-devtools-mcp@latest'], env: {} };

if (ghToken) {
  m['github'] = { command: 'npx', args: ['-y', '@modelcontextprotocol/server-github'], env: { GITHUB_PERSONAL_ACCESS_TOKEN: ghToken } };
}
m['team-sync'] = { type: 'stdio', command: 'node', args: [MCPS_ROOT + '/team-sync/scripts/launcher.js'], env: ghToken ? { GITHUB_TOKEN: ghToken } : {} };

// RH-OptimERP MCPs
for (const [name, pkg] of Object.entries({ 'prompt-library': 'prompt-library-orchestrator', 'qco': 'quality-code-orchestrator' })) {
  const dist = path.join(MCPS_ROOT, pkg, 'dist', 'index.js');
  if (fs.existsSync(dist)) {
    m[name] = { type: 'stdio', command: 'node', args: [dist.replace(/\\/g, '/')], env: {} };
    console.log(`  + ${name}`);
  }
}

// EAGLES AI Platform MCPs
const dataRoot = EAGLES_ROOT + '/.data';
for (const [name, pkg] of Object.entries({
  'token-tracker': 'token-tracker-mcp', 'provider-router': 'provider-router-mcp',
  'vector-memory': 'vector-memory-mcp', 'drift-detector': 'drift-detector-mcp',
  'verification': 'verification-mcp', 'orchestrator': 'orchestrator-mcp'
})) {
  const dist = path.join(EAGLES_ROOT, 'packages', pkg, 'dist', 'index.js');
  if (fs.existsSync(dist)) {
    m[name] = { type: 'stdio', command: 'node', args: [dist.replace(/\\/g, '/')], env: { EAGLES_DATA_ROOT: dataRoot } };
    console.log(`  + ${name}`);
  } else {
    console.log(`  - ${name} (not built)`);
  }
}

fs.writeFileSync(CLAUDE_JSON, JSON.stringify(config, null, 2));
const totalMcps = Object.keys(m).length;
console.log(`  ${totalMcps} MCPs registered\n`);

// ============================================================
// Step 9: Directories + Rules + Agents + Hooks
// ============================================================
console.log('[9/9] Installing CLAUDE.md, rules, agents, hooks...');

for (const dir of [CLAUDE_DIR, HOOKS_DIR, path.join(CLAUDE_DIR, 'rules', 'common'), path.join(CLAUDE_DIR, 'rules', 'dotnet'), path.join(CLAUDE_DIR, 'agents')]) {
  fs.mkdirSync(dir, { recursive: true });
}

// Copy shared CLAUDE.md to C:\RH-OptimERP\ (team workspace root)
const claudeMdSrc = path.join(CONFIG_ROOT, 'CLAUDE.md');
const claudeMdDst = 'C:/RH-OptimERP/CLAUDE.md';
if (fs.existsSync(claudeMdSrc)) {
  fs.copyFileSync(claudeMdSrc, claudeMdDst);
  console.log('  + CLAUDE.md → C:\\RH-OptimERP\\');
}

let ruleCount = 0;
for (const dir of ['common', 'dotnet']) {
  const src = path.join(CONFIG_ROOT, 'rules', dir);
  const dst = path.join(CLAUDE_DIR, 'rules', dir);
  if (fs.existsSync(src)) {
    for (const file of fs.readdirSync(src).filter(f => fs.statSync(path.join(src, f)).isFile())) {
      fs.copyFileSync(path.join(src, file), path.join(dst, file));
      ruleCount++;
    }
  }
}

let agentCount = 0;
const agentsSrc = path.join(CONFIG_ROOT, 'agents');
if (fs.existsSync(agentsSrc)) {
  for (const file of fs.readdirSync(agentsSrc).filter(f => fs.statSync(path.join(agentsSrc, f)).isFile())) {
    fs.copyFileSync(path.join(agentsSrc, file), path.join(CLAUDE_DIR, 'agents', file));
    agentCount++;
  }
}

let hookCount = 0;
for (const hook of ['cost-router.py', 'token-tracker-hook.py', 'skill-extractor.py', 'rate-limit-detector.py']) {
  const src = path.join(CONFIG_ROOT, 'hooks', hook);
  if (fs.existsSync(src)) { fs.copyFileSync(src, path.join(HOOKS_DIR, hook)); hookCount++; }
}

// Wire permissions + hooks in settings.json
let settings = {};
try { settings = JSON.parse(fs.readFileSync(SETTINGS_JSON, 'utf-8')); } catch { settings = {}; }

// Add MCP tool permissions (required for auto-trigger — without these Claude asks permission first)
if (!settings.permissions) settings.permissions = {};
if (!settings.permissions.allow) settings.permissions.allow = [];
const requiredPerms = [
  'mcp__team-sync__startup_check', 'mcp__team-sync__team_status',
  'mcp__team-sync__watch_integration', 'mcp__team-sync__check_impact',
  'mcp__team-sync__get_context', 'mcp__team-sync__create_issue',
  'mcp__team-sync__analyze_reference', 'mcp__team-sync__sync_contracts',
  'mcp__team-sync__self_update',
  'mcp__filesystem__list_directory', 'mcp__filesystem__read_file',
  'mcp__filesystem__read_text_file', 'mcp__filesystem__directory_tree',
  'mcp__filesystem__search_files', 'mcp__filesystem__write_file',
  'mcp__filesystem__list_allowed_directories', 'mcp__filesystem__read_multiple_files',
  'mcp__github__get_file_contents', 'mcp__github__search_code',
  'mcp__github__list_issues', 'mcp__github__list_pull_requests',
  'mcp__prompt-library__get_prompt', 'mcp__prompt-library__list_prompts',
  'mcp__prompt-library__get_prompt_parameters',
  'mcp__context7__resolve-library-id', 'mcp__context7__query-docs'
];
let addedPerms = 0;
for (const perm of requiredPerms) {
  if (!settings.permissions.allow.includes(perm)) {
    settings.permissions.allow.push(perm);
    addedPerms++;
  }
}
if (addedPerms > 0) console.log(`  + ${addedPerms} MCP tool permissions added`);

if (!settings.hooks) settings.hooks = {};
const preH = settings.hooks.PreToolUse || [];
if (!preH.some(h => JSON.stringify(h).includes('cost-router'))) {
  preH.push({ matcher: 'Agent', hooks: [{ type: 'command', command: 'node -e "try{require(require(\'os\').homedir()+\'/.claude/hooks/cost-router.js\')}catch{}" 2>NUL || ver>NUL' }] });
  settings.hooks.PreToolUse = preH;
}
const postH = settings.hooks.PostToolUse || [];
if (!postH.some(h => JSON.stringify(h).includes('token-tracker'))) {
  postH.push({ matcher: 'Agent|Read|Edit|Write|Bash|Grep|Glob|WebFetch|WebSearch|TodoWrite|ToolSearch|mcp__.*', hooks: [{ type: 'command', command: 'node -e "try{require(require(\'os\').homedir()+\'/.claude/hooks/token-tracker-hook.js\')}catch{}" 2>NUL || ver>NUL' }] });
  settings.hooks.PostToolUse = postH;
}
fs.writeFileSync(SETTINGS_JSON, JSON.stringify(settings, null, 2));

console.log(`  ${ruleCount} rules | ${agentCount} agents | ${hookCount} hooks\n`);

// ============================================================
// Summary
// ============================================================
console.log('=============================================');
if (errors.length === 0) {
  console.log('  HEAL COMPLETE — ALL GREEN');
} else {
  console.log('  HEAL COMPLETE — WITH WARNINGS:');
  errors.forEach(e => console.log(`    ! ${e}`));
}
console.log('');
console.log(`  MCPs:     ${totalMcps} registered`);
console.log(`  Token:    ${ghToken ? 'YES' : 'MISSING'}`);
console.log(`  Native:   ${nativeOk ? 'OK' : 'BROKEN (need C++ build tools)'}`);
console.log(`  Rules:    ${ruleCount}`);
console.log(`  Agents:   ${agentCount}`);
console.log(`  Hooks:    ${hookCount}`);
console.log('');
if (!nativeOk) {
  console.log('  TO FIX NATIVE DEPS:');
  console.log('    npm install -g windows-build-tools');
  console.log('    Then re-run: node scripts/heal.js');
  console.log('');
}
console.log('  → Restart VS Code to activate');
console.log('=============================================');
