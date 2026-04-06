import { test, expect } from '@playwright/test';
import { DocsPage } from './pages/DocsPage';

test.describe('Documentation Hub — Content Pages', () => {
  let docs: DocsPage;

  test.beforeEach(async ({ page }) => {
    docs = new DocsPage(page);
  });

  test.describe('Getting Started', () => {
    test('page renders with prerequisites', async ({ page }) => {
      await docs.goto('/guide/getting-started');
      const content = await page.textContent('body');
      expect(content).toContain('Node');
      expect(content).toContain('pnpm');
    });

    test('has installation code block', async ({ page }) => {
      await docs.goto('/guide/getting-started');
      const codeBlocks = await docs.hasCodeBlock();
      expect(codeBlocks).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Architecture', () => {
    test('page renders with monorepo overview', async ({ page }) => {
      await docs.goto('/guide/architecture');
      const headings = await docs.getHeadings();
      expect(headings.some(h => h.includes('Architecture'))).toBe(true);
    });

    test('mentions key packages', async ({ page }) => {
      await docs.goto('/guide/architecture');
      const content = await page.textContent('body');
      expect(content).toContain('shared-utils');
      expect(content).toContain('data-layer');
    });
  });

  test.describe('Hooks Guide', () => {
    test('page renders with 4 hooks in overview table', async ({ page }) => {
      await docs.goto('/guide/hooks');
      const table = page.locator('table').first();
      await expect(table).toBeVisible();
      const rows = await table.locator('tbody tr').count();
      expect(rows).toBeGreaterThanOrEqual(4);
    });

    test('documents cost-router forced routing', async ({ page }) => {
      await docs.goto('/guide/hooks');
      const content = await page.textContent('body');
      expect(content).toContain('cost-router');
      expect(content).toContain('Force');
    });

    test('documents skill-extractor', async ({ page }) => {
      await docs.goto('/guide/hooks');
      const content = await page.textContent('body');
      expect(content).toContain('skill-extractor');
      expect(content).toContain('SonaLearningStore');
    });

    test('documents rate-limit-detector', async ({ page }) => {
      await docs.goto('/guide/hooks');
      const content = await page.textContent('body');
      expect(content).toContain('rate-limit');
      expect(content).toContain('429');
    });
  });

  test.describe('Packages', () => {
    test('packages index lists shared-utils, data-layer, tool-registry', async ({ page }) => {
      await docs.goto('/packages/');
      const content = await page.textContent('body');
      expect(content).toContain('shared-utils');
      expect(content).toContain('data-layer');
      expect(content).toContain('tool-registry');
    });

    test('shared-utils page has API reference table', async ({ page }) => {
      await docs.goto('/packages/shared-utils');
      const tables = page.locator('table');
      const count = await tables.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Reference', () => {
    test('API reference page lists tool schemas', async ({ page }) => {
      await docs.goto('/reference/api');
      const content = await page.textContent('body');
      expect(content).toContain('API');
    });

    test('configuration page documents env vars', async ({ page }) => {
      await docs.goto('/reference/configuration');
      const content = await page.textContent('body');
      expect(content).toContain('EAGLES_DATA_ROOT');
    });

    test('troubleshooting page has common issues', async ({ page }) => {
      await docs.goto('/reference/troubleshooting');
      const headings = await docs.getHeadings();
      expect(headings.length).toBeGreaterThanOrEqual(2);
    });
  });

  test.describe('ADRs', () => {
    test('ADR index lists decisions', async ({ page }) => {
      await docs.goto('/adrs/');
      const content = await page.textContent('body');
      expect(content).toContain('ADR');
    });

    test('ADR pages have Status and Context sections', async ({ page }) => {
      await docs.goto('/adrs/001-monorepo');
      const content = await page.textContent('body');
      expect(content).toContain('Status');
      expect(content).toContain('Context');
    });
  });
});
