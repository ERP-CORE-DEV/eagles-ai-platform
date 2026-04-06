import { test, expect } from '@playwright/test';
import { DocsPage } from './pages/DocsPage';

test.describe('Documentation Hub — Landing Page', () => {
  let docs: DocsPage;

  test.beforeEach(async ({ page }) => {
    docs = new DocsPage(page);
    await docs.goto('/');
  });

  test('displays hero section with correct title', async () => {
    await expect(docs.heroTitle).toContainText('EAGLES AI Platform');
  });

  test('displays tagline with key stats', async () => {
    await expect(docs.heroTagline).toContainText('7 MCP servers');
    await expect(docs.heroTagline).toContainText('52 tools');
    await expect(docs.heroTagline).toContainText('62 skills');
  });

  test('has 3 CTA buttons (Get Started, API Reference, GitHub)', async () => {
    const actions = await docs.heroActions.count();
    expect(actions).toBeGreaterThanOrEqual(3);
    await expect(docs.heroActions.first()).toContainText('Get Started');
  });

  test('displays 6 feature cards (one per MCP server)', async () => {
    const featureCount = await docs.features.count();
    expect(featureCount).toBe(6);
  });

  test('feature cards link to correct MCP server pages', async ({ page }) => {
    // Links wrap the feature articles: a[href] > article.VPFeature
    const featureLinks = page.locator('.VPFeatures a[href]');
    const hrefs = await featureLinks.evaluateAll(els => els.map(el => el.getAttribute('href')));
    expect(hrefs).toContain('/mcp-servers/token-tracker');
    expect(hrefs).toContain('/mcp-servers/vector-memory');
    expect(hrefs).toContain('/mcp-servers/drift-detector');
  });

  test('has Quick Install code block', async ({ page }) => {
    const codeBlocks = page.locator('pre code, div[class*="language-"]');
    const count = await codeBlocks.count();
    expect(count).toBeGreaterThanOrEqual(1);
    const firstBlock = await codeBlocks.first().textContent();
    expect(firstBlock).toContain('pnpm install');
  });

  test('shows Platform at a Glance table', async ({ page }) => {
    const table = page.locator('table').first();
    await expect(table).toBeVisible();
    const text = await table.textContent();
    expect(text).toContain('MCP Servers');
    expect(text).toContain('52');
    expect(text).toContain('484');
  });

  test('footer shows ELYSTEK copyright', async () => {
    await expect(docs.footer).toContainText('ELYSTEK');
  });
});
