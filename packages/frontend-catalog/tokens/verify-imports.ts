/**
 * Verification script — ensures dist/tokens.js exports are importable and typed.
 * Run: tsc --noEmit tokens/verify-imports.ts
 */
import {
  BaseViolet600,
  SystemActionPrimary,
  ComponentButtonPrimaryBg,
  TypographyFamilyBase,
  Spacing16,
  RadiusFull,
} from '../dist/tokens.js';

// Type assertions — these will fail tsc if exports are missing or wrong type
const primary: string = BaseViolet600;
const action: string = SystemActionPrimary;
const buttonBg: string = ComponentButtonPrimaryBg;
const font: string = TypographyFamilyBase;
const space: string = Spacing16;
const round: string = RadiusFull;

console.log('Token imports verified:', { primary, action, buttonBg, font, space, round });
