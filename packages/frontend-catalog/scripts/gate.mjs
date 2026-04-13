#!/usr/bin/env node
// gate.mjs — zero-dep quality gate for the frontend-catalog.
// Runs forbidden-pattern regex + a11y static checks + dark-mode story parity
// across components/ui/**. Exits non-zero on any finding.
//
// Usage: node scripts/gate.mjs [--manifest]
//   --manifest  also writes components.manifest.json

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const uiDir = join(root, 'components', 'ui');
const writeManifest = process.argv.includes('--manifest');

// -----------------------------------------------------------------------------
// Forbidden patterns — token-only contract
// -----------------------------------------------------------------------------
const FORBIDDEN = [
  { re: /#[0-9a-fA-F]{3,8}\b/, msg: 'hex color literal (use var(--*) tokens)' },
  { re: /\brgb\s*\(/, msg: 'rgb() literal (use var(--*) tokens)' },
  { re: /\bhsl\s*\(/, msg: 'hsl() literal (use var(--*) tokens)' },
  { re: /style\s*=\s*\{\{/, msg: 'inline style={{...}} (use CSS classes)' },
  { re: /React\.FC\b/, msg: 'React.FC type (use explicit function signature)' },
  { re: /className\s*=\s*"[^"]*\b[a-z]+-\[/, msg: 'Tailwind arbitrary value' },
];

// CSS-only: color: named colors (not var(--*), not transparent/inherit/currentColor)
const CSS_NAMED_COLOR = /\bcolor\s*:\s*(?!var\(|transparent|inherit|currentColor|unset|initial)[a-z]/i;

// A11y static checks
const A11Y = [
  {
    re: /<button[^>]*>\s*<(svg|img|Icon)/,
    msg: 'icon-only button missing aria-label',
    check: (match, content, idx) => {
      // look backwards ~200 chars for aria-label on same tag
      const slice = content.slice(Math.max(0, idx - 300), idx + match.length);
      return !/aria-label\s*=/.test(slice);
    },
  },
  {
    re: /<input(?![^>]*type\s*=\s*["'](?:hidden|submit|button|reset)["'])[^>]*>/,
    msg: 'input without aria-label, aria-labelledby, or id+label',
    check: (match) => {
      return !/aria-label\s*=/.test(match) && !/aria-labelledby\s*=/.test(match) && !/\bid\s*=/.test(match);
    },
  },
  {
    re: /<div[^>]*onClick/,
    msg: 'clickable div (use <button> instead)',
  },
];

// -----------------------------------------------------------------------------
// Walk
// -----------------------------------------------------------------------------
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const findings = [];
function report(file, line, msg) {
  findings.push({ file: relative(root, file).replace(/\\/g, '/'), line, msg });
}

function lineOf(content, index) {
  return content.slice(0, index).split('\n').length;
}

function checkFile(file, content) {
  const ext = extname(file);
  const isCss = ext === '.css';
  const isTsx = ext === '.tsx' || ext === '.ts';

  // Forbidden regex pack
  for (const { re, msg } of FORBIDDEN) {
    const flags = re.flags.includes('g') ? re.flags : re.flags + 'g';
    const globalRe = new RegExp(re.source, flags);
    let m;
    while ((m = globalRe.exec(content)) != null) {
      // Skip SVG viewBox + stroke-dasharray (non-color numerics match #\d)
      if (m[0].startsWith('#') && /viewBox|dasharray|dashoffset/i.test(content.slice(Math.max(0, m.index - 40), m.index))) continue;
      report(file, lineOf(content, m.index), msg + ' — ' + m[0]);
    }
  }

  // CSS named color
  if (isCss) {
    const globalRe = new RegExp(CSS_NAMED_COLOR.source, 'gi');
    let m;
    while ((m = globalRe.exec(content)) != null) {
      report(file, lineOf(content, m.index), 'CSS named color (use var(--*) tokens) — ' + m[0].trim());
    }
  }

  // A11y
  if (isTsx) {
    for (const rule of A11Y) {
      const globalRe = new RegExp(rule.re.source, 'g');
      let m;
      while ((m = globalRe.exec(content)) != null) {
        if (!rule.check || rule.check(m[0], content, m.index)) {
          report(file, lineOf(content, m.index), 'a11y: ' + rule.msg);
        }
      }
    }
  }
}

// -----------------------------------------------------------------------------
// Dark-mode story parity: every *.stories.tsx must export Default + DarkMode
// -----------------------------------------------------------------------------
function checkStoryParity(file, content) {
  if (!file.endsWith('.stories.tsx')) return;
  const hasDefault = /export\s+const\s+Default\b/.test(content);
  const hasDark = /export\s+const\s+DarkMode\b/.test(content);
  if (!hasDefault) report(file, 1, 'story missing `export const Default`');
  if (!hasDark) report(file, 1, 'story missing `export const DarkMode` (dark-mode parity rule)');
}

// -----------------------------------------------------------------------------
// Manifest — one entry per component (tsx files that aren't stories or tests)
// -----------------------------------------------------------------------------
function buildManifest(files) {
  const components = [];
  for (const f of files) {
    if (!f.endsWith('.tsx')) continue;
    if (f.endsWith('.stories.tsx') || f.endsWith('.test.tsx')) continue;
    const name = basename(f, '.tsx');
    const dir = dirname(f);
    const hasCss = files.some((x) => x === join(dir, name + '.css'));
    const hasStory = files.some((x) => x === join(dir, name + '.stories.tsx'));
    const content = readFileSync(f, 'utf8');
    const tokens = [...content.matchAll(/var\(--([a-z0-9-]+)\)/g)].map((m) => m[1]);
    const cssTokens = hasCss
      ? [...readFileSync(join(dir, name + '.css'), 'utf8').matchAll(/var\(--([a-z0-9-]+)\)/g)].map((m) => m[1])
      : [];
    const allTokens = [...new Set([...tokens, ...cssTokens])].sort();
    components.push({
      name,
      file: relative(root, f).replace(/\\/g, '/'),
      hasCss,
      hasStory,
      tokens: allTokens,
    });
  }
  return { generatedAt: new Date().toISOString(), count: components.length, components };
}

// -----------------------------------------------------------------------------
// Run
// -----------------------------------------------------------------------------
const files = walk(uiDir);
for (const f of files) {
  if (!/\.(tsx|ts|css)$/.test(f)) continue;
  const content = readFileSync(f, 'utf8');
  checkFile(f, content);
  checkStoryParity(f, content);
}

if (writeManifest) {
  const manifest = buildManifest(files);
  writeFileSync(join(root, 'components.manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`manifest: ${manifest.count} components written to components.manifest.json`);
}

if (findings.length) {
  console.error(`\n❌ gate failed — ${findings.length} finding(s):\n`);
  for (const f of findings) {
    console.error(`  ${f.file}:${f.line}  ${f.msg}`);
  }
  process.exit(1);
}

const componentCount = files.filter((f) => f.endsWith('.tsx') && !f.endsWith('.stories.tsx') && !f.endsWith('.test.tsx')).length;
console.log(`✅ gate passed — ${componentCount} component(s), 0 findings`);
