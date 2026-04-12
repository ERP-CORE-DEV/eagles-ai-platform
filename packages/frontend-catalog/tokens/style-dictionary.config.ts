/**
 * Style Dictionary v4 configuration — 3 output platforms:
 * 1. dist/tokens.css      — CSS custom properties (drop-in replacement for design-tokens.css)
 * 2. dist/tokens.js       — ESM typed token object
 * 3. dist/tailwind-tokens.js — Tailwind preset (theme.extend values)
 */

export default {
  source: ['tokens/tokens.w3c.json'],
  log: { verbosity: 'verbose' },

  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'dist/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: {
            outputReferences: true,
            selector: ':root',
          },
        },
      ],
    },

    js: {
      transformGroup: 'js',
      buildPath: 'dist/',
      files: [
        {
          destination: 'tokens.js',
          format: 'javascript/es6',
        },
      ],
    },

    tailwind: {
      transformGroup: 'js',
      buildPath: 'dist/',
      files: [
        {
          destination: 'tailwind-tokens.js',
          format: 'javascript/es6',
          options: {
            outputReferences: false,
          },
        },
      ],
    },
  },
};
