import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createFrontendCatalogServer } from "./server.js";

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  const server = createFrontendCatalogServer();
  await server.connect(transport);
}

main().catch((error: unknown) => {
  process.stderr.write(`[frontend-catalog-mcp] Fatal: ${String(error)}\n`);
  process.exit(1);
});
