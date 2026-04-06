import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'EAGLES AI Platform',
  description: 'AI-Powered Development Infrastructure for Claude Code',
  lang: 'en-US',
  lastUpdated: true,
  cleanUrls: true,

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/eagle.svg' }],
  ],

  themeConfig: {
    logo: '/eagle.svg',
    siteTitle: 'EAGLES AI',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'MCP Servers', link: '/mcp-servers/' },
      { text: 'Packages', link: '/packages/' },
      { text: 'Reference', link: '/reference/api' },
      { text: 'ADRs', link: '/adrs/' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Architecture', link: '/guide/architecture' },
            { text: 'Mission (/mission)', link: '/guide/mission' },
            { text: 'DAG Orchestration', link: '/guide/dag-orchestration' },
          ],
        },
        {
          text: 'Configuration',
          items: [
            { text: 'Hooks', link: '/guide/hooks' },
            { text: 'Team Setup', link: '/guide/team-setup' },
          ],
        },
      ],
      '/mcp-servers/': [
        {
          text: 'MCP Servers',
          items: [
            { text: 'Overview', link: '/mcp-servers/' },
            { text: 'Token Tracker', link: '/mcp-servers/token-tracker' },
            { text: 'Provider Router', link: '/mcp-servers/provider-router' },
            { text: 'Vector Memory', link: '/mcp-servers/vector-memory' },
            { text: 'Drift Detector', link: '/mcp-servers/drift-detector' },
            { text: 'Verification', link: '/mcp-servers/verification' },
            { text: 'Orchestrator', link: '/mcp-servers/orchestrator' },
          ],
        },
      ],
      '/packages/': [
        {
          text: 'Packages',
          items: [
            { text: 'Overview', link: '/packages/' },
            { text: 'shared-utils', link: '/packages/shared-utils' },
            { text: 'data-layer', link: '/packages/data-layer' },
            { text: 'tool-registry', link: '/packages/tool-registry' },
          ],
        },
      ],
      '/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'API Reference', link: '/reference/api' },
            { text: 'Configuration', link: '/reference/configuration' },
            { text: 'Troubleshooting', link: '/reference/troubleshooting' },
          ],
        },
      ],
      '/adrs/': [
        {
          text: 'Architecture Decisions',
          items: [
            { text: 'Index', link: '/adrs/' },
            { text: 'ADR-001: Monorepo', link: '/adrs/001-monorepo' },
            { text: 'ADR-002: Event Bus', link: '/adrs/002-event-bus' },
            { text: 'ADR-003: Embeddings', link: '/adrs/003-embeddings' },
            { text: 'ADR-004: Benchmarks', link: '/adrs/004-benchmarks' },
            { text: 'ADR-006: Competitive Gap Analysis', link: '/adrs/006-competitive-gaps' },
            { text: 'ADR-007: 1000-Repo Analysis', link: '/adrs/007-1000-repo-analysis' },
            { text: 'ADR-008: Session-Start Contract', link: '/adrs/008-session-start' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ERP-CORE-DEV/eagles-ai-platform' },
    ],

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Built by EAGLES Team — RH-OptimERP',
      copyright: 'Copyright 2026 ELYSTEK',
    },

    editLink: {
      pattern: 'https://github.com/ERP-CORE-DEV/eagles-ai-platform/edit/main/packages/docs/:path',
      text: 'Edit this page on GitHub',
    },
  },
})
