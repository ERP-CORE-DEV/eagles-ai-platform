import { type Page, type Locator } from '@playwright/test';

export class DocsPage {
  readonly page: Page;
  readonly hero: Locator;
  readonly heroTitle: Locator;
  readonly heroTagline: Locator;
  readonly heroActions: Locator;
  readonly features: Locator;
  readonly nav: Locator;
  readonly sidebar: Locator;
  readonly content: Locator;
  readonly searchButton: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.hero = page.locator('.VPHero');
    this.heroTitle = page.locator('.VPHero .name');
    this.heroTagline = page.locator('.VPHero .tagline');
    this.heroActions = page.locator('.VPHero .actions a');
    this.features = page.locator('.VPFeatures .VPFeature');
    this.nav = page.locator('.VPNavBar');
    this.sidebar = page.locator('.VPSidebar');
    this.content = page.locator('.vp-doc');
    this.searchButton = page.locator('.VPNavBarSearch button, .DocSearch-Button');
    this.footer = page.locator('.VPFooter');
  }

  async goto(path = '/') {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  async getNavLinks() {
    return this.nav.locator('.VPNavBarMenuLink, .VPNavBarMenuGroup').allTextContents();
  }

  async getSidebarLinks() {
    return this.sidebar.locator('a').allTextContents();
  }

  async clickNavLink(text: string) {
    await this.nav.locator(`a:has-text("${text}")`).first().click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickSidebarLink(text: string) {
    await this.sidebar.locator(`a:has-text("${text}")`).first().click();
    await this.page.waitForLoadState('networkidle');
  }

  async getHeadings() {
    return this.content.locator('h1, h2, h3').allTextContents();
  }

  async getTableRows(tableIndex = 0) {
    const tables = this.content.locator('table');
    const table = tables.nth(tableIndex);
    return table.locator('tbody tr').count();
  }

  async hasCodeBlock() {
    return this.content.locator('pre code, div[class*="language-"]').count();
  }
}
