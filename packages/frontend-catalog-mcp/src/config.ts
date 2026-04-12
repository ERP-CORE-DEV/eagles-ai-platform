import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function resolveCatalogRoot(): string {
  const fromEnv = process.env.FRONTEND_CATALOG_ROOT;
  if (fromEnv && existsSync(fromEnv)) return fromEnv;

  const sibling = resolve(__dirname, "../../frontend-catalog");
  if (existsSync(sibling)) return sibling;

  const cwdSibling = resolve(process.cwd(), "packages/frontend-catalog");
  if (existsSync(cwdSibling)) return cwdSibling;

  throw new Error(
    "frontend-catalog package not found. Set FRONTEND_CATALOG_ROOT or run inside the eagles-ai-platform monorepo.",
  );
}

export function resolveCatalogPath(relative: string): string {
  return resolve(resolveCatalogRoot(), relative);
}
