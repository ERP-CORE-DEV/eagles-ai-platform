#!/usr/bin/env node
/**
 * Dump SKILL_CATALOG from tool-registry into .data/skill-catalog.json
 *
 * Used by eagles-session-start.py hook to surface the 62-skill catalog at
 * session start without requiring a SQLite seed or a live tool-registry MCP call.
 *
 * Runs from repo root:
 *   node scripts/dump-skill-catalog.mjs
 */
import { SKILL_CATALOG } from '../packages/tool-registry/dist/index.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_ROOT = join(__dirname, '..', '.data');
const OUTPUT = join(DATA_ROOT, 'skill-catalog.json');

mkdirSync(DATA_ROOT, { recursive: true });

const simplified = SKILL_CATALOG.map((s) => ({
  id: s.id,
  name: s.name,
  description: s.description || '',
  category: s.category || 'general',
  tags: s.tags || [],
  estimatedMinutes: s.estimatedMinutes || null,
}));

const payload = {
  count: simplified.length,
  generatedAt: new Date().toISOString(),
  skills: simplified,
};

writeFileSync(OUTPUT, JSON.stringify(payload, null, 2));
console.log(`Dumped ${simplified.length} skills → ${OUTPUT}`);
