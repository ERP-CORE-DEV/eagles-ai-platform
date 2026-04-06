import { describe, it, expect, afterEach } from "vitest";
import { expandContext } from "../src/mission/context-expander.js";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, sep } from "node:path";
import { tmpdir } from "node:os";

const tempDirs: string[] = [];

function createTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "ctx-expander-"));
  tempDirs.push(dir);
  return dir;
}

function writeFile(dir: string, relativePath: string, content: string): void {
  const parts = relativePath.split("/");
  if (parts.length > 1) {
    const subDir = join(dir, ...parts.slice(0, -1));
    mkdirSync(subDir, { recursive: true });
  }
  writeFileSync(join(dir, ...parts), content);
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      // Windows may keep lock — let OS clean on reboot
    }
  }
});

describe("expandContext — layer detection", () => {
  it("expandContext_backendDir_discoversBackendLayer", () => {
    const dir = createTempDir();
    writeFile(dir, "backend/main.py", "def main(): pass\n");

    const result = expandContext(dir);

    const layerNames = result.layers.map((l) => l.name);
    expect(layerNames).toContain("backend");
  });

  it("expandContext_frontendDir_discoversFrontendLayer", () => {
    const dir = createTempDir();
    writeFile(dir, "frontend/package.json", '{"name":"app"}');

    const result = expandContext(dir);

    const layerNames = result.layers.map((l) => l.name);
    expect(layerNames).toContain("frontend");
  });

  it("expandContext_multipleDirs_discoversThreeLayers", () => {
    const dir = createTempDir();
    writeFile(dir, "backend/app.ts", "export const x = 1;\n");
    writeFile(dir, "frontend/index.tsx", "export default function App() { return null; }\n");
    writeFile(dir, "infra/Dockerfile", "FROM node:20\n");

    const result = expandContext(dir);

    const layerNames = result.layers.map((l) => l.name);
    expect(layerNames).toContain("backend");
    expect(layerNames).toContain("frontend");
    expect(layerNames).toContain("infra");
  });
});

describe("expandContext — CLAUDE.md reading", () => {
  it("expandContext_withClaudeMd_returnsSummaryContainingContent", () => {
    const dir = createTempDir();
    writeFile(dir, "CLAUDE.md", "## Architecture\nFastAPI backend with CosmosDB\n");

    const result = expandContext(dir);

    expect(result.claudeMdSummary).toContain("FastAPI");
  });

  it("expandContext_noClaudeMd_returnsEmptySummary", () => {
    const dir = createTempDir();

    const result = expandContext(dir);

    expect(result.claudeMdSummary).toBe("");
  });
});

describe("expandContext — file and LOC counting", () => {
  it("expandContext_multipleCodeFiles_countsAllFiles", () => {
    const dir = createTempDir();
    writeFile(dir, "a.py", "x = 1\n");
    writeFile(dir, "b.py", "y = 2\n");
    writeFile(dir, "c.py", "z = 3\n");
    writeFile(dir, "d.ts", "const w = 4;\n");
    writeFile(dir, "e.ts", "const v = 5;\n");

    const result = expandContext(dir);

    expect(result.totalFiles).toBeGreaterThanOrEqual(5);
  });

  it("expandContext_fileWith10Lines_countsLoc", () => {
    const dir = createTempDir();
    const lines = Array.from({ length: 10 }, (_, i) => `line${i + 1}`).join("\n");
    writeFile(dir, "main.py", lines);

    const result = expandContext(dir);

    expect(result.totalLOC).toBeGreaterThanOrEqual(10);
  });

  it("expandContext_nodeModulesDir_skipsNodeModulesInLoc", () => {
    const dir = createTempDir();
    writeFile(dir, "index.ts", "const x = 1;\n");
    const bigContent = Array.from({ length: 100 }, (_, i) => `line${i}`).join("\n");
    writeFile(dir, "node_modules/big.js", bigContent);

    const result = expandContext(dir);

    // node_modules content should not be counted — only index.ts (1 line)
    expect(result.totalLOC).toBeLessThan(50);
  });
});

describe("expandContext — tech stack detection", () => {
  it("expandContext_requirementsTxt_detectsPython", () => {
    const dir = createTempDir();
    writeFile(dir, "requirements.txt", "requests==2.31.0\nfastapi==0.110.0\n");

    const result = expandContext(dir);

    expect(result.techStack).toContain("python");
  });

  it("expandContext_tsconfigJson_detectsTypeScript", () => {
    const dir = createTempDir();
    writeFile(dir, "tsconfig.json", '{"compilerOptions": {"strict": true}}');

    const result = expandContext(dir);

    expect(result.techStack).toContain("typescript");
  });
});

describe("expandContext — empty project", () => {
  it("expandContext_emptyDir_returnsZeroCountsAndEmptyArrays", () => {
    const dir = createTempDir();

    const result = expandContext(dir);

    expect(result.layers).toEqual([]);
    expect(result.totalFiles).toBe(0);
    expect(result.totalLOC).toBe(0);
  });
});

describe("expandContext — real project", () => {
  it("expandContext_eaglesAiPlatform_detectsPackagesLayerAndTypeScript", () => {
    const result = expandContext("C:/RH-OptimERP/eagles-ai-platform");

    const layerNames = result.layers.map((l) => l.name);
    expect(layerNames).toContain("packages");
    expect(result.techStack).toContain("typescript");
    expect(result.totalFiles).toBeGreaterThan(50);
  });
});
