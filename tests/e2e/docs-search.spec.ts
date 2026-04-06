import { test, expect } from '@playwright/test';
import { DocsPage } from './pages/DocsPage';

test.describe('Documentation Hub — Search', () => {
  let docs: DocsPage;

  test.beforeEach(async ({ page }) => {
    docs = new DocsPage(page);
    await docs.goto('/');
  });

  test('search button is visible in navbar', async () => {
    await expect(docs.searchButton).toBeVisible();
  });

  test('clicking search button opens search modal', async ({ page }) => {
    await docs.searchButton.click();
    const modal = page.locator('.VPLocalSearchBox, .DocSearch-Modal');
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  test('search input accepts text', async ({ page }) => {
    await docs.searchButton.click();
    const input = page.locator('.VPLocalSearchBox input, .DocSearch-Input');
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill('token tracker');
    await page.waitForTimeout(500);
    // Results should appear
    const results = page.locator('.VPLocalSearchBox .result, .DocSearch-Hit');
    const count = await results.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('search results link to correct pages', async ({ page }) => {
    await docs.searchButton.click();
    const input = page.locator('.VPLocalSearchBox input, .DocSearch-Input');
    await input.fill('drift detector');
    await page.waitForTimeout(500);
    const firstResult = page.locator('[role="listbox"] [role="option"] a').first();
    const href = await firstResult.getAttribute('href');
    expect(href).toContain('drift');
  });

  test('keyboard shortcut opens search', async ({ page }) => {
    // VitePress uses Ctrl+K or / to open search
    await page.keyboard.press('Control+k');
    const modal = page.locator('.VPLocalSearchBox, .DocSearch-Modal');
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  test('Escape closes search modal', async ({ page }) => {
    await docs.searchButton.click();
    const modal = page.locator('.VPLocalSearchBox, .DocSearch-Modal');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible({ timeout: 3000 });
  });

  test('empty search shows no results', async ({ page }) => {
    await docs.searchButton.click();
    const input = page.locator('.VPLocalSearchBox input, .DocSearch-Input');
    await input.fill('xyznonexistentterm123');
    await page.waitForTimeout(500);
    const results = page.locator('.VPLocalSearchBox .result, .DocSearch-Hit');
    const count = await results.count();
    expect(count).toBe(0);
  });
});
