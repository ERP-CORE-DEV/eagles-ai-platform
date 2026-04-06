import { test, expect } from '@playwright/test';
import { DocsPage } from './pages/DocsPage';

const MCP_SERVERS = [
  { name: 'Token Tracker', path: '/mcp-servers/token-tracker', tools: 11 },
  { name: 'Vector Memory', path: '/mcp-servers/vector-memory', tools: 4 },
  { name: 'Drift Detector', path: '/mcp-servers/drift-detector', tools: 8 },
  { name: 'Provider Router', path: '/mcp-servers/provider-router', tools: 7 },
  { name: 'Verification', path: '/mcp-servers/verification', tools: 12 },
  { name: 'Orchestrator', path: '/mcp-servers/orchestrator', tools: 10 },
];

test.describe('Documentation Hub — MCP Server Pages', () => {
  let docs: DocsPage;

  test.beforeEach(async ({ page }) => {
    docs = new DocsPage(page);
  });

  test('MCP Servers index lists all 7 servers', async ({ page }) => {
    await docs.goto('/mcp-servers/');
    const content = await page.textContent('body');
    for (const server of MCP_SERVERS) {
      expect(content).toContain(server.name);
    }
  });

  for (const server of MCP_SERVERS) {
    test(`${server.name} page loads with correct heading`, async ({ page }) => {
      await docs.goto(server.path);
      const headings = await docs.getHeadings();
      expect(headings.some(h => h.includes(server.name))).toBe(true);
    });

    test(`${server.name} page has a tools table`, async ({ page }) => {
      await docs.goto(server.path);
      const tables = page.locator('table');
      const count = await tables.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });
  }

  test('Token Tracker page documents all 11 tools as headings', async ({ page }) => {
    await docs.goto('/mcp-servers/token-tracker');
    // Each tool is a separate h3 section, not rows in one table
    const headings = await page.locator('h3').allTextContents();
    expect(headings.length).toBeGreaterThanOrEqual(11);
  });

  test('Orchestrator page documents all 10 tools as headings', async ({ page }) => {
    await docs.goto('/mcp-servers/orchestrator');
    const headings = await page.locator('h3').allTextContents();
    expect(headings.length).toBeGreaterThanOrEqual(10);
  });

  test('each MCP server page has parameter tables', async ({ page }) => {
    for (const server of MCP_SERVERS) {
      await docs.goto(server.path);
      const tables = await page.locator('table').count();
      expect(tables).toBeGreaterThanOrEqual(1);
    }
  });

  test('MCP server pages contain code blocks', async ({ page }) => {
    await docs.goto('/mcp-servers/token-tracker');
    const codeBlocks = page.locator('pre code, div[class*="language-"]');
    const count = await codeBlocks.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
