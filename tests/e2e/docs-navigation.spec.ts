import { test, expect } from '@playwright/test';
import { DocsPage } from './pages/DocsPage';

test.describe('Documentation Hub — Navigation', () => {
  let docs: DocsPage;

  test.beforeEach(async ({ page }) => {
    docs = new DocsPage(page);
    await docs.goto('/');
  });

  test('navbar contains Guide, MCP Servers, Packages, Reference links', async () => {
    const links = await docs.getNavLinks();
    const text = links.join(' ');
    expect(text).toContain('Guide');
    expect(text).toContain('MCP Servers');
    expect(text).toContain('Packages');
    expect(text).toContain('Reference');
  });

  test('clicking Guide nav link navigates to getting-started', async ({ page }) => {
    await docs.clickNavLink('Guide');
    await expect(page).toHaveURL(/\/guide\//);
  });

  test('clicking MCP Servers nav link navigates to mcp-servers index', async ({ page }) => {
    await docs.clickNavLink('MCP Servers');
    await expect(page).toHaveURL(/\/mcp-servers\//);
  });

  test('sidebar is visible on guide pages', async ({ page }) => {
    await docs.goto('/guide/getting-started');
    await expect(docs.sidebar).toBeVisible();
  });

  test('sidebar contains expected guide links', async ({ page }) => {
    await docs.goto('/guide/getting-started');
    const links = await docs.getSidebarLinks();
    const text = links.join(' ');
    expect(text).toContain('Getting Started');
    expect(text).toContain('Architecture');
    expect(text).toContain('Hooks');
  });

  test('clicking sidebar link navigates to correct page', async ({ page }) => {
    await docs.goto('/guide/getting-started');
    await docs.clickSidebarLink('Architecture');
    await expect(page).toHaveURL(/\/guide\/architecture/);
    const headings = await docs.getHeadings();
    expect(headings.some(h => h.includes('Architecture'))).toBe(true);
  });

  test('breadcrumb or back navigation works from deep pages', async ({ page }) => {
    await docs.goto('/mcp-servers/token-tracker');
    const nav = page.locator('.VPNavBar');
    await expect(nav).toBeVisible();
    // Can navigate back to MCP Servers index
    await docs.clickNavLink('MCP Servers');
    await expect(page).toHaveURL(/\/mcp-servers\//);
  });

  test('page transitions load new content', async ({ page }) => {
    await docs.goto('/guide/getting-started');
    const firstHeadings = await docs.getHeadings();
    // Navigate to another page
    await docs.clickSidebarLink('Hooks');
    await page.waitForLoadState('networkidle');
    const secondHeadings = await docs.getHeadings();
    // Content should change
    expect(secondHeadings).not.toEqual(firstHeadings);
    expect(secondHeadings.some(h => h.includes('Hook'))).toBe(true);
  });

  test('invalid route shows 404 or empty content', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    // VitePress dev server may show 404, or redirect to home, or show empty content area
    const is404 = body?.includes('404') || body?.includes('not found') || body?.includes('Not Found');
    const isHome = body?.includes('EAGLES AI Platform');
    expect(is404 || isHome).toBe(true);
  });
});
