import type { Meta, StoryObj } from '@storybook/react';
import type React from 'react';
import Button from '../components/ui/Button';
import StatusBadge, {
  FRENCH_LABELS,
  STATE_COLORS,
} from '../components/ui/StatusBadge';
import '../dist/tokens.css';

const meta: Meta = {
  title: 'Catalog/Showcase',
  parameters: {
    layout: 'fullscreen',
    docs: { disable: true },
  },
};

export default meta;
type Story = StoryObj;

const page: React.CSSProperties = {
  fontFamily: 'var(--typography-family-base)',
  color: 'var(--system-text-primary)',
  background: 'var(--system-background-default)',
  minHeight: '100vh',
  padding: '0 0 64px',
};

const hero: React.CSSProperties = {
  background:
    'linear-gradient(135deg, var(--base-violet-600) 0%, var(--base-violet-800) 50%, var(--base-slate-900) 100%)',
  padding: '64px 48px 80px',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
};

const heroOrb: React.CSSProperties = {
  position: 'absolute',
  top: '-120px',
  right: '-80px',
  width: '320px',
  height: '320px',
  borderRadius: '50%',
  background:
    'radial-gradient(circle, rgba(167,139,250,0.45) 0%, rgba(167,139,250,0) 70%)',
  pointerEvents: 'none',
};

const heroInner: React.CSSProperties = {
  maxWidth: '1120px',
  margin: '0 auto',
  position: 'relative',
  zIndex: 1,
};

const eyebrow: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 14px',
  borderRadius: '9999px',
  background: 'rgba(255,255,255,0.12)',
  border: '1px solid rgba(255,255,255,0.22)',
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  backdropFilter: 'blur(12px)',
};

const heroTitle: React.CSSProperties = {
  fontSize: 'clamp(2.25rem, 4vw, 3.5rem)',
  fontWeight: 700,
  lineHeight: 1.1,
  margin: '20px 0 16px',
  letterSpacing: '-0.02em',
};

const heroLead: React.CSSProperties = {
  fontSize: '1.125rem',
  lineHeight: 1.6,
  color: 'rgba(255,255,255,0.82)',
  maxWidth: '640px',
  margin: 0,
};

const heroStats: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: '16px',
  marginTop: '36px',
  maxWidth: '720px',
};

const statCard: React.CSSProperties = {
  padding: '16px 18px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.16)',
  backdropFilter: 'blur(10px)',
};

const container: React.CSSProperties = {
  maxWidth: '1120px',
  margin: '-40px auto 0',
  padding: '0 48px',
  position: 'relative',
  zIndex: 2,
  display: 'grid',
  gap: '32px',
};

const section: React.CSSProperties = {
  background: 'var(--system-background-surface)',
  borderRadius: 'var(--component-card-radius)',
  boxShadow: 'var(--component-card-shadow)',
  padding: '32px 36px',
  border: '1px solid var(--system-border-default)',
  color: 'var(--system-text-primary)',
};

const sectionHead: React.CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: '16px',
  marginBottom: '24px',
  paddingBottom: '16px',
  borderBottom: '1px solid var(--system-border-default)',
};

const sectionTitle: React.CSSProperties = {
  fontSize: '1.25rem',
  fontWeight: 600,
  margin: 0,
  letterSpacing: '-0.01em',
};

const sectionKicker: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--system-text-link)',
  marginBottom: '6px',
};

const sectionMeta: React.CSSProperties = {
  fontSize: '0.8125rem',
  color: 'var(--system-text-secondary)',
  fontFamily: 'var(--typography-family-mono)',
};

const swatchGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(11, minmax(0, 1fr))',
  gap: '8px',
};

const swatch = (bg: string, label: string): React.CSSProperties => ({
  background: bg,
  borderRadius: '8px',
  padding: '12px 10px',
  minHeight: '64px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  color: label,
  fontSize: '0.6875rem',
  fontFamily: 'var(--typography-family-mono)',
  border: '1px solid rgba(0,0,0,0.04)',
});

const scaleRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: '20px',
  padding: '10px 0',
  borderBottom: '1px solid var(--system-border-default)',
};

const buttonGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '16px 20px',
};

const badgeWall: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
};

const VIOLET = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const SLATE = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

const TYPE_SCALE: Array<[string, string, string]> = [
  ['xs', '0.75rem', '12 / 18'],
  ['sm', '0.875rem', '14 / 20'],
  ['base', '1rem', '16 / 24'],
  ['lg', '1.125rem', '18 / 28'],
  ['xl', '1.25rem', '20 / 30'],
  ['2xl', '1.5rem', '24 / 32'],
  ['3xl', '1.875rem', '30 / 36'],
];

export const Catalog: Story = {
  render: () => (
    <div style={page}>
      <header style={hero}>
        <div style={heroOrb} />
        <div style={heroInner}>
          <span style={eyebrow}>
            <span>◆</span> frontend-catalog · v0.1.0
          </span>
          <h1 style={heroTitle}>Design system showcase</h1>
          <p style={heroLead}>
            A live test page rendering every token, button variant and status
            badge from the catalog. Open this story in Storybook, toggle
            dark/light via the toolbar, and use it as the acceptance surface
            for visual-regression snapshots.
          </p>
          <div style={heroStats}>
            <div style={statCard}>
              <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>138</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.75 }}>
                design tokens
              </div>
            </div>
            <div style={statCard}>
              <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>6×3</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.75 }}>
                button matrix
              </div>
            </div>
            <div style={statCard}>
              <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>15</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.75 }}>
                status states
              </div>
            </div>
            <div style={statCard}>
              <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>8</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.75 }}>
                baseline layers
              </div>
            </div>
          </div>
        </div>
      </header>

      <main style={container}>
        <section style={section}>
          <div style={sectionHead}>
            <div>
              <div style={sectionKicker}>L1 · Tokens</div>
              <h2 style={sectionTitle}>Brand palette — violet</h2>
            </div>
            <div style={sectionMeta}>--base-violet-{'{50..950}'}</div>
          </div>
          <div style={swatchGrid}>
            {VIOLET.map((step) => (
              <div
                key={step}
                style={swatch(
                  `var(--base-violet-${step})`,
                  step >= 500 ? 'white' : 'var(--base-violet-900)',
                )}
              >
                <span style={{ fontWeight: 600 }}>{step}</span>
                <span style={{ opacity: 0.85 }}>violet</span>
              </div>
            ))}
          </div>
        </section>

        <section style={section}>
          <div style={sectionHead}>
            <div>
              <div style={sectionKicker}>L1 · Tokens</div>
              <h2 style={sectionTitle}>Neutrals — slate</h2>
            </div>
            <div style={sectionMeta}>--base-slate-{'{50..950}'}</div>
          </div>
          <div style={swatchGrid}>
            {SLATE.map((step) => (
              <div
                key={step}
                style={swatch(
                  `var(--base-slate-${step})`,
                  step >= 500 ? 'white' : 'var(--base-slate-900)',
                )}
              >
                <span style={{ fontWeight: 600 }}>{step}</span>
                <span style={{ opacity: 0.85 }}>slate</span>
              </div>
            ))}
          </div>
        </section>

        <section style={section}>
          <div style={sectionHead}>
            <div>
              <div style={sectionKicker}>L1 · Tokens</div>
              <h2 style={sectionTitle}>Semantic colors</h2>
            </div>
            <div style={sectionMeta}>emerald · amber · rose · sky · blue</div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
              gap: '12px',
            }}
          >
            {[
              ['emerald', '--base-semantic-emerald-500', 'success'],
              ['amber', '--base-semantic-amber-500', 'warning'],
              ['rose', '--base-semantic-rose-500', 'danger'],
              ['sky', '--base-semantic-sky-500', 'info'],
              ['blue', '--base-semantic-blue-500', 'link'],
            ].map(([name, varName, role]) => (
              <div
                key={name}
                style={{
                  padding: '18px 16px',
                  borderRadius: '12px',
                  background: `var(${varName})`,
                  color: 'white',
                  minHeight: '92px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '1rem' }}>{name}</div>
                <div
                  style={{
                    fontSize: '0.6875rem',
                    fontFamily: 'var(--typography-family-mono)',
                    opacity: 0.85,
                  }}
                >
                  {role}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={section}>
          <div style={sectionHead}>
            <div>
              <div style={sectionKicker}>L1 · Typography</div>
              <h2 style={sectionTitle}>Type scale</h2>
            </div>
            <div style={sectionMeta}>Inter · 7 steps</div>
          </div>
          {TYPE_SCALE.map(([name, size, lh]) => (
            <div key={name} style={scaleRow}>
              <code
                style={{
                  minWidth: '48px',
                  color: 'var(--system-text-link)',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--typography-family-mono)',
                }}
              >
                {name}
              </code>
              <div
                style={{
                  fontSize: size,
                  fontWeight: 500,
                  flex: 1,
                  color: 'var(--system-text-primary)',
                }}
              >
                The quick brown fox jumps over the lazy dog
              </div>
              <code
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--system-text-secondary)',
                  fontFamily: 'var(--typography-family-mono)',
                }}
              >
                {size} · {lh}
              </code>
            </div>
          ))}
        </section>

        <section style={section}>
          <div style={sectionHead}>
            <div>
              <div style={sectionKicker}>L3 · Components</div>
              <h2 style={sectionTitle}>Button — 6 variants × 3 sizes</h2>
            </div>
            <div style={sectionMeta}>+ loading, + disabled</div>
          </div>
          <div style={buttonGrid}>
            {(
              [
                'primary',
                'secondary',
                'success',
                'danger',
                'warning',
                'info',
              ] as const
            ).map((v) => (
              <div
                key={v}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--system-text-secondary)',
                  }}
                >
                  {v}
                </div>
                <Button variant={v} size="small">
                  Small
                </Button>
                <Button variant={v} size="medium">
                  Medium
                </Button>
                <Button variant={v} size="large">
                  Large
                </Button>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid var(--system-border-default)',
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <Button variant="primary" loading>
              Saving…
            </Button>
            <Button variant="secondary" disabled>
              Disabled
            </Button>
            <Button variant="success" size="large">
              Confirm submission
            </Button>
            <Button variant="danger" size="small">
              Delete
            </Button>
          </div>
        </section>

        <section style={section}>
          <div style={sectionHead}>
            <div>
              <div style={sectionKicker}>L3 · Components</div>
              <h2 style={sectionTitle}>StatusBadge — all states</h2>
            </div>
            <div style={sectionMeta}>15 FR labels · antd Tag</div>
          </div>
          <div style={badgeWall}>
            {Object.keys(STATE_COLORS).map((status) => (
              <StatusBadge key={status} status={status} />
            ))}
          </div>
          <div
            style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid var(--system-border-default)',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--system-text-secondary)' }}>
              small:
            </span>
            {['Draft', 'PendingReview', 'Approved', 'Rejected'].map((s) => (
              <StatusBadge key={s} status={s} size="small" />
            ))}
          </div>
        </section>

        <section
          style={{
            ...section,
            background:
              'linear-gradient(135deg, color-mix(in srgb, var(--system-action-primary) 10%, var(--system-background-surface)) 0%, var(--system-background-surface) 100%)',
          }}
        >
          <div style={sectionHead}>
            <div>
              <div style={sectionKicker}>L4 · Patterns</div>
              <h2 style={sectionTitle}>Composition — detail card</h2>
            </div>
            <div style={sectionMeta}>tokens + Button + StatusBadge</div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
            }}
          >
            {[
              { name: 'Amélie Dubois', role: 'Senior Frontend Engineer', state: 'Approved' },
              { name: 'Karim Bensalah', role: 'Product Designer', state: 'PendingReview' },
              { name: 'Léa Martin', role: 'Staff Backend Engineer', state: 'InProgress' },
              { name: 'Julien Rossi', role: 'Engineering Manager', state: 'Draft' },
            ].map((p) => (
              <div
                key={p.name}
                style={{
                  background: 'var(--system-background-elevated)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid var(--system-border-default)',
                  boxShadow: 'var(--component-card-shadow)',
                  color: 'var(--system-text-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                      {p.name}
                    </div>
                    <div
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--system-text-secondary)',
                        marginTop: '2px',
                      }}
                    >
                      {p.role}
                    </div>
                  </div>
                  <StatusBadge status={p.state} size="small" />
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--system-border-default)',
                  }}
                >
                  <Button variant="primary" size="small">
                    View
                  </Button>
                  <Button variant="secondary" size="small">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer
          style={{
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--system-text-tertiary)',
            fontFamily: 'var(--typography-family-mono)',
            padding: '16px 0 0',
          }}
        >
          Labels rendered: {Object.keys(FRENCH_LABELS).length} · Built from{' '}
          <code>dist/tokens.css</code>
        </footer>
      </main>
    </div>
  ),
};
