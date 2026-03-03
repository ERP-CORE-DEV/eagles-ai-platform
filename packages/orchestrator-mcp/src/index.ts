import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createOrchestratorServer } from "./server.js";

async function main(): Promise<void> {
  const dbDir = process.env["EAGLES_DATA_ROOT"] ?? join(process.cwd(), ".eagles-data");
  mkdirSync(dbDir, { recursive: true });

  const transport = new StdioServerTransport();
  const server = createOrchestratorServer(dbDir);
  await server.connect(transport);
}

main().catch((error: unknown) => {
  process.stderr.write(`[orchestrator-mcp] Fatal: ${String(error)}\n`);
  process.exit(1);
});
