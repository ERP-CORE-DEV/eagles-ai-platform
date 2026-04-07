import { existsSync, readdirSync, statSync } from "node:fs";
import { join, basename } from "node:path";
import type { ResolvedProject } from "./types.js";

export interface ProjectEntry {
  readonly name: string;
  readonly path: string;
  readonly aliases: readonly string[];
}

// ---------------------------------------------------------------------------
// Auto-discovery configuration
// ---------------------------------------------------------------------------

/**
 * Root directories to scan for projects. A project is any directory
 * containing a CLAUDE.md file (up to MAX_DEPTH levels deep).
 *
 * Add more roots via `addScanRoot()` at runtime.
 */
const SCAN_ROOTS: string[] = [
  "C:/",
  "C:/RH-OptimERP",
  "C:/Users/hatim/projects",
];

const MAX_DEPTH = 3;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Directories to skip during scanning (large or irrelevant).
 */
const SKIP_DIRS = new Set([
  "node_modules", ".git", "dist", "bin", "obj", "__pycache__",
  ".next", ".nuxt", "build", "coverage", ".vscode", ".idea",
  "AppData", "Windows", "Program Files", "Program Files (x86)",
  "$Recycle.Bin", "System Volume Information",
  "ProgramData", "Recovery",
]);

// ---------------------------------------------------------------------------
// Manual overrides — always available, never evicted by cache refresh
// ---------------------------------------------------------------------------

const _manualEntries: ProjectEntry[] = [];

export function addProject(entry: ProjectEntry): void {
  _manualEntries.push(entry);
  // Invalidate cache so next resolve picks up the new entry
  _cache = null;
}

export function addScanRoot(rootPath: string): void {
  if (!SCAN_ROOTS.includes(rootPath)) {
    SCAN_ROOTS.push(rootPath);
    _cache = null;
  }
}

// ---------------------------------------------------------------------------
// Discovery engine
// ---------------------------------------------------------------------------

let _cache: { entries: ProjectEntry[]; timestamp: number } | null = null;

/**
 * Generate aliases from a project directory name.
 * "agent-comptable" → ["agent-comptable", "comptable", "agent"]
 * "rh-optimerp-sourcing-candidate-attraction" → ["sourcing", "candidate", "attraction", ...]
 */
function generateAliases(dirName: string): string[] {
  const aliases = [dirName.toLowerCase()];
  const parts = dirName.toLowerCase().split(/[-_]/);

  for (const part of parts) {
    if (part.length >= 3 && !aliases.includes(part)) {
      aliases.push(part);
    }
  }

  // Common shorthand: first+last parts
  if (parts.length >= 3) {
    const shorthand = parts[parts.length - 1];
    if (shorthand.length >= 3 && !aliases.includes(shorthand)) {
      aliases.push(shorthand);
    }
  }

  return aliases;
}

/**
 * Recursively scan a directory for CLAUDE.md files.
 * Returns discovered ProjectEntry objects.
 */
function scanDirectory(dir: string, depth: number): ProjectEntry[] {
  if (depth > MAX_DEPTH) return [];

  const entries: ProjectEntry[] = [];

  try {
    const items = readdirSync(dir);

    // Check if THIS directory is a project root.
    // Strong signal: CLAUDE.md (explicit project marker)
    // Medium signal: .git directory (it's a repo root)
    // Weak signal: package.json / *.sln / pyproject.toml (only at depth 1-2, not deep nesting)
    const hasClaudeMd = items.includes("CLAUDE.md");
    const hasGitDir = items.includes(".git");
    const hasBuildFile = items.includes("package.json") ||
      items.some(i => i.endsWith(".sln")) ||
      items.includes("pyproject.toml") ||
      items.includes("Cargo.toml") ||
      items.includes("go.mod");
    const isProject = hasClaudeMd || hasGitDir || (hasBuildFile && depth <= 2);

    if (isProject && depth > 0) {  // depth > 0 avoids treating C:/ itself as a project
      const dirName = basename(dir);
      entries.push({
        name: dirName,
        path: dir.replace(/\\/g, "/"),
        aliases: generateAliases(dirName),
      });
      // Don't scan subdirectories of a project (its children are part of the project)
      return entries;
    }

    // Recurse into subdirectories
    for (const item of items) {
      if (SKIP_DIRS.has(item)) continue;
      if (item.startsWith(".")) continue;

      const fullPath = join(dir, item);
      try {
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          entries.push(...scanDirectory(fullPath, depth + 1));
        }
      } catch {
        // Permission denied or broken symlink — skip
      }
    }
  } catch {
    // Can't read directory — skip
  }

  return entries;
}

/**
 * Discover all projects by scanning SCAN_ROOTS.
 * Results are cached for CACHE_TTL_MS.
 */
function discoverProjects(): ProjectEntry[] {
  const now = Date.now();

  if (_cache && (now - _cache.timestamp) < CACHE_TTL_MS) {
    return [..._cache.entries, ..._manualEntries];
  }

  const discovered: ProjectEntry[] = [];
  const seenPaths = new Set<string>();

  for (const root of SCAN_ROOTS) {
    if (!existsSync(root)) continue;

    const found = scanDirectory(root, 0);
    for (const entry of found) {
      const normalized = entry.path.toLowerCase();
      if (!seenPaths.has(normalized)) {
        seenPaths.add(normalized);
        discovered.push(entry);
      }
    }
  }

  _cache = { entries: discovered, timestamp: now };
  return [...discovered, ..._manualEntries];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function listProjects(): ProjectEntry[] {
  return discoverProjects();
}

function matchByKeywords(keywords: string[], registry: ProjectEntry[]): ProjectEntry | null {
  // Expand hyphenated keywords: "hiring-management" → ["hiring-management", "hiring", "management"]
  const lowerKeywords: string[] = [];
  for (const k of keywords) {
    const lower = k.toLowerCase();
    lowerKeywords.push(lower);
    if (lower.includes("-")) {
      for (const part of lower.split("-")) {
        if (part.length >= 3 && !lowerKeywords.includes(part)) {
          lowerKeywords.push(part);
        }
      }
    }
  }

  for (const keyword of lowerKeywords) {
    for (const project of registry) {
      for (const alias of project.aliases) {
        if (alias === keyword) {
          return project;
        }
      }
    }
  }
  return null;
}

/**
 * Match CWD to a project.
 *
 * Strategy:
 *  1. CWD is INSIDE a project (project path is strict prefix of CWD) → exact match (deepest wins)
 *  2. CWD is EXACTLY a project root, BUT check if it's also a parent of other projects:
 *     - If CWD has child projects in registry → it's an umbrella dir, treat as ambiguous
 *     - If CWD has no children → it's a leaf project, resolve it
 *  3. CWD is a PARENT of multiple projects → ambiguous, return null (caller shows candidates)
 *  4. CWD is a PARENT of exactly one project → return that single child
 *  5. CWD has CLAUDE.md but isn't in registry → ad-hoc entry (only if no child projects)
 *
 * NEVER use substring includes on project name — causes false matches when CWD
 * is a parent dir like "C:/RH-OptimERP" (Houssine's workspace bug).
 */
function matchByCwd(cwd: string, registry: ProjectEntry[]): ProjectEntry | null {
  const normalizedCwd = cwd.replace(/\\/g, "/").toLowerCase();
  const cwdWithSlash = normalizedCwd.endsWith("/") ? normalizedCwd : normalizedCwd + "/";

  // Count child projects (projects UNDER this CWD, not equal to it)
  const childProjects = registry.filter(p => {
    const pp = p.path.toLowerCase();
    return pp !== normalizedCwd && pp.startsWith(cwdWithSlash);
  });

  // Strategy 1: CWD is strictly INSIDE a project (CWD is deeper than project path)
  // Skip umbrella projects (those that have other projects as children).
  const insideMatches = registry
    .filter(p => {
      const projectPath = p.path.toLowerCase();
      const projectWithSlash = projectPath.endsWith("/") ? projectPath : projectPath + "/";
      if (normalizedCwd === projectPath) return false; // exact match handled in Strategy 2
      if (!cwdWithSlash.startsWith(projectWithSlash)) return false;
      // Skip umbrella dirs: does this project have children in the registry?
      const hasChildren = registry.some(
        other => other.path.toLowerCase() !== projectPath &&
                 other.path.toLowerCase().startsWith(projectWithSlash)
      );
      return !hasChildren;
    })
    .sort((a, b) => b.path.length - a.path.length);

  if (insideMatches.length > 0) {
    return insideMatches[0];
  }

  // Strategy 2: CWD is exactly a project root
  const exactMatch = registry.find(p => p.path.toLowerCase() === normalizedCwd);
  if (exactMatch && childProjects.length === 0) {
    // Leaf project — no children, safe to resolve
    return exactMatch;
  }
  // If exactMatch exists but has children → it's an umbrella (like RH-OptimERP)
  // Fall through to child-based resolution

  // Strategy 3+4: CWD is a parent of project(s)
  if (childProjects.length === 1) {
    return childProjects[0];
  }
  // childProjects.length > 1 → ambiguous, fall through to return null

  // Strategy 5: CWD has CLAUDE.md but isn't in registry and has no children
  if (childProjects.length === 0) {
    const claudeMdPath = join(cwd, "CLAUDE.md");
    if (existsSync(claudeMdPath)) {
      const dirName = basename(cwd);
      return {
        name: dirName,
        path: cwd.replace(/\\/g, "/"),
        aliases: generateAliases(dirName),
      };
    }
  }

  return null;
}

export function resolveProject(keywords: string[], cwd?: string): ResolvedProject {
  const registry = discoverProjects();

  const byKeyword = matchByKeywords(keywords, registry);
  if (byKeyword !== null) {
    return {
      resolved: true,
      name: byKeyword.name,
      path: byKeyword.path,
    };
  }

  if (cwd !== undefined) {
    const byCwd = matchByCwd(cwd, registry);
    if (byCwd !== null) {
      return {
        resolved: true,
        name: byCwd.name,
        path: byCwd.path,
      };
    }

    // matchByCwd returned null — check if CWD is a parent of multiple projects
    // to show only relevant candidates (not ALL projects)
    const normalizedCwd = cwd.replace(/\\/g, "/").toLowerCase();
    const cwdWithSlash = normalizedCwd.endsWith("/") ? normalizedCwd : normalizedCwd + "/";
    const childProjects = registry.filter(
      p => p.path.toLowerCase().startsWith(cwdWithSlash)
    );

    if (childProjects.length > 1) {
      return {
        resolved: false,
        name: "",
        path: "",
        candidates: childProjects.map((p) => p.name),
      };
    }
  }

  return {
    resolved: false,
    name: "",
    path: "",
    candidates: registry.map((p) => p.name),
  };
}

/**
 * Force cache refresh. Useful after creating new projects.
 */
export function refreshProjectCache(): void {
  _cache = null;
}
