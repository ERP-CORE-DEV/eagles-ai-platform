# Frontend Catalog — Deploy

The landing + Storybook bundle lives in `dist/landing/` after running `pnpm build`. Pick one or both deploy targets.

## Prerequisites

```bash
cd packages/frontend-catalog
pnpm build        # runs build:tokens + build:storybook
cp dist/tokens.css dist/landing/tokens.css
cp -r dist/storybook dist/landing/storybook
```

`dist/landing/` contains:
- `index.html` (~10 KB, token-only CSS)
- `tokens.css` (W3C DTCG compiled)
- `storybook/` (full Storybook 8.6 static export)

## Option 1 — Netlify (primary)

```bash
# One-time
npm install -g netlify-cli
netlify login

# Deploy
netlify deploy --prod --dir dist/landing --site eagles-frontend-catalog
```

The first run will prompt to create or link a site. After deploy, Netlify prints the public `*.netlify.app` URL. Save it.

## Option 2 — GitHub Pages (canary)

```bash
# One-time: requires a GitHub repo with Pages enabled on the gh-pages branch
npx gh-pages -d dist/landing -b gh-pages
```

URL: `https://<org>.github.io/<repo>/`

## Smoke test

```bash
curl -sSf https://<deployed-url>/ | grep -q "AI-queryable design system" && echo OK
curl -sSf https://<deployed-url>/storybook/ | grep -q "storybook" && echo OK
```

## Local preview

```bash
npx http-server dist/landing -p 8080
# open http://localhost:8080
```
