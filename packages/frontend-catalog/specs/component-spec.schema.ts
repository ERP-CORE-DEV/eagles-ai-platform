/**
 * Component spec schema — the contract every catalog component declares.
 * Consumed by catalog_generate_from_spec MCP tool to scaffold new components.
 */

export type Category = 'layout' | 'data' | 'forms' | 'feedback' | 'navigation' | 'erp';

export interface PropSpec {
  name: string;
  type: string;
  optional?: boolean;
  default?: string | number | boolean;
  doc?: string;
}

export interface VariantSpec {
  name: string;
  values: string[];
  default: string;
}

export interface ComponentSpec {
  name: string;
  category: Category;
  description: string;
  props: PropSpec[];
  variants?: VariantSpec[];
  a11y: {
    role?: string;
    ariaLabels?: string[];
    keyboardKeys?: string[];
  };
  tokensUsed: string[];
  goldReferenceHash?: string;
}

export const CATEGORIES: Record<Category, string> = {
  layout: 'Structural scaffolding — shells, pages, sections',
  data: 'Data display — tables, cards, badges, metrics',
  forms: 'User input — fields, pickers, validation',
  feedback: 'Transient state — toasts, alerts, progress',
  navigation: 'Wayfinding — menus, tabs, breadcrumbs',
  erp: 'Domain-specific — ERP/HR workflows',
};
