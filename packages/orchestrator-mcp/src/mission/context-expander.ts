import type { ExpandedContext, Layer } from "./types.js";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { resolveDataPath } from "../config.js";

const SKIP_DIRS = new Set([
  "node_modules", ".git", "dist", "bin", "obj", "__pycache__",
  ".next", ".nuxt", "build", "coverage", ".vscode", ".idea",
  "_archive", ".eagles-data", ".data", "prebuilt", "test-results",
]);

const CODE_EXTENSIONS = new Set([
  ".py", ".ts", ".tsx", ".js", ".jsx", ".cs", ".java", ".go", ".rs", ".rb", ".php",
]);

const MAX_FILE_BYTES = 1_048_576; // 1MB

const LAYER_PATTERNS: Array<{ name: string; dirs: string[] }> = [
  { name: "backend",  dirs: ["backend", "server", "api", "src/backend"] },
  { name: "frontend", dirs: ["frontend", "client", "src/frontend", "web"] },
  { name: "cli",      dirs: ["cli", "scripts", "services", "extractors"] },
  { name: "infra",    dirs: ["infra", "deploy", "helm", "terraform", "k8s"] },
  { name: "packages", dirs: ["packages"] },
];

interface FileStat {
  extension: string;
  loc: number;
}

function isSkippedDir(name: string): boolean {
  return SKIP_DIRS.has(name);
}

function countLoc(filePath: string): number {
  try {
    const stat = statSync(filePath);
    if (stat.size > MAX_FILE_BYTES) {
      return 0;
    }
    const content = readFileSync(filePath, "utf8");
    return content.split("\n").filter((line) => line.trim().length > 0).length;
  } catch {
    return 0;
  }
}

function walkDirectory(dirPath: string): FileStat[] {
  const results: FileStat[] = [];

  let entries: string[];
  try {
    entries = readdirSync(dirPath);
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (isSkippedDir(entry)) {
      continue;
    }

    const fullPath = join(dirPath, entry);
    let stat;
    try {
      stat = statSync(fullPath);
    } catch {
      continue;
    }

    if (stat.isDirectory()) {
      const nested = walkDirectory(fullPath);
      for (const item of nested) {
        results.push(item);
      }
    } else if (stat.isFile()) {
      const ext = extname(entry).toLowerCase();
      if (CODE_EXTENSIONS.has(ext)) {
        results.push({ extension: ext, loc: countLoc(fullPath) });
      }
    }
  }

  return results;
}

function detectLayers(projectPath: string): Layer[] {
  const layers: Layer[] = [];

  for (const pattern of LAYER_PATTERNS) {
    for (const dirName of pattern.dirs) {
      const layerPath = join(projectPath, dirName);
      if (existsSync(layerPath)) {
        const stats = walkDirectory(layerPath);
        layers.push({
          name: pattern.name,
          path: layerPath.replace(/\\/g, "/"),
          files: stats.length,
          loc: stats.reduce((sum, s) => sum + s.loc, 0),
        });
        break;
      }
    }
  }

  return layers;
}

function detectTechStack(projectPath: string, fileExtensions: Set<string>): string[] {
  const detected = new Set<string>();

  if (fileExtensions.has(".py")) {
    detected.add("python");
  }
  if (fileExtensions.has(".ts") || fileExtensions.has(".tsx")) {
    detected.add("typescript");
  }
  if (fileExtensions.has(".cs") || fileExtensions.has(".csproj") || fileExtensions.has(".sln")) {
    detected.add("dotnet");
  }
  if (fileExtensions.has(".java")) {
    detected.add("java");
  }
  if (fileExtensions.has(".go")) {
    detected.add("go");
  }
  if (fileExtensions.has(".rs")) {
    detected.add("rust");
  }
  if (fileExtensions.has(".rb")) {
    detected.add("ruby");
  }
  if (fileExtensions.has(".php")) {
    detected.add("php");
  }

  const tsconfigPath = join(projectPath, "tsconfig.json");
  if (existsSync(tsconfigPath)) {
    detected.add("typescript");
  }

  const requirementsPath = join(projectPath, "requirements.txt");
  if (existsSync(requirementsPath)) {
    detected.add("python");
    try {
      const content = readFileSync(requirementsPath, "utf8").toLowerCase();
      if (content.includes("fastapi")) {
        detected.add("fastapi");
      }
    } catch {
      // ignore read errors
    }
  }

  const pyprojectPath = join(projectPath, "pyproject.toml");
  if (existsSync(pyprojectPath)) {
    detected.add("python");
  }

  const pipfilePath = join(projectPath, "Pipfile");
  if (existsSync(pipfilePath)) {
    detected.add("python");
  }

  const packageJsonPath = join(projectPath, "package.json");
  if (existsSync(packageJsonPath)) {
    detected.add("node");
    try {
      const content = readFileSync(packageJsonPath, "utf8");
      const parsed = JSON.parse(content) as Record<string, unknown>;
      const deps = {
        ...(parsed["dependencies"] as Record<string, unknown> | undefined ?? {}),
        ...(parsed["devDependencies"] as Record<string, unknown> | undefined ?? {}),
      };
      if ("react" in deps) {
        detected.add("react");
      }
    } catch {
      // ignore parse errors
    }
  }

  const dockerfilePath = join(projectPath, "Dockerfile");
  const dockerComposePath = join(projectPath, "docker-compose.yml");
  if (existsSync(dockerfilePath) || existsSync(dockerComposePath)) {
    detected.add("docker");
  }

  const chartYamlPath = join(projectPath, "Chart.yaml");
  const helmDir = join(projectPath, "helm");
  if (existsSync(chartYamlPath) || existsSync(helmDir)) {
    detected.add("helm");
  }

  return Array.from(detected);
}

function collectExtensionsFromStats(stats: FileStat[]): Set<string> {
  const extensions = new Set<string>();
  for (const s of stats) {
    extensions.add(s.extension);
  }
  return extensions;
}

function readClaudeMdSummary(projectPath: string): string {
  const claudeMdPath = join(projectPath, "CLAUDE.md");
  if (!existsSync(claudeMdPath)) {
    return "";
  }
  try {
    const content = readFileSync(claudeMdPath, "utf8");
    return content.slice(0, 2000);
  } catch {
    return "";
  }
}

interface SessionRow {
  summary: string;
  keywords: string;
  project: string;
  started_at: string;
}

async function loadPastSessionContext(projectName: string): Promise<string[]> {
  const dbPath = resolveDataPath("session-index.sqlite");
  if (!existsSync(dbPath)) return [];

  try {
    // Dynamic import keeps better-sqlite3 out of the critical path when the
    // DB does not exist — avoids load-time errors in lean test environments.
    const { default: Database } = await import("better-sqlite3") as {
      default: new (path: string, options?: object) => {
        prepare: (sql: string) => { all: (...args: unknown[]) => unknown[] };
        close: () => void;
      };
    };

    const db = new Database(dbPath, { readonly: true });
    try {
      const rows = db
        .prepare(
          `SELECT summary, keywords, project, started_at
           FROM sessions
           WHERE project LIKE ?
           ORDER BY started_at DESC
           LIMIT 5`,
        )
        .all(`%${projectName}%`) as SessionRow[];

      return rows.map((row) => {
        const date = row.started_at.slice(0, 10);
        const keywords = row.keywords ? ` [${row.keywords}]` : "";
        return `[${date}] ${row.project}${keywords}: ${row.summary}`;
      });
    } finally {
      db.close();
    }
  } catch {
    return [];
  }
}

export async function expandContext(projectPath: string): Promise<ExpandedContext> {
  const claudeMdSummary = readClaudeMdSummary(projectPath);

  const allStats = walkDirectory(projectPath);
  const totalFiles = allStats.length;
  const totalLOC = allStats.reduce((sum, s) => sum + s.loc, 0);

  const extensions = collectExtensionsFromStats(allStats);
  const techStack = detectTechStack(projectPath, extensions);

  const layers = detectLayers(projectPath);

  const projectName = projectPath.split(/[/\\]/).filter(Boolean).at(-1) ?? "";
  const pastFindings = await loadPastSessionContext(projectName);

  return {
    layers,
    totalFiles,
    totalLOC,
    techStack,
    pastFindings,
    claudeMdSummary,
  };
}
