# shared-utils

Foundation package providing types, pricing constants, and validators shared across all packages.

**Package**: `@eagles-ai-platform/shared-utils`
**Dependencies**: None (zero runtime deps)

## Exports

### Model Pricing

```typescript
export const MODEL_PRICING = {
  "claude-opus-4-6":   { inputPer1M: 15.00, outputPer1M: 75.00 },
  "claude-sonnet-4-6": { inputPer1M: 3.00,  outputPer1M: 15.00 },
  "claude-haiku-4-5":  { inputPer1M: 0.80,  outputPer1M: 4.00 },
  "kimi-k2-thinking":  { inputPer1M: 0.60,  outputPer1M: 2.50 },
  "deepseek-r1":       { inputPer1M: 0.55,  outputPer1M: 2.19 },
  "deepseek-v3":       { inputPer1M: 0.27,  outputPer1M: 1.10 },
  "codestral-2501":    { inputPer1M: 0.30,  outputPer1M: 0.90 },
} as const;
```

### Budget Thresholds

```typescript
export const BUDGET_THRESHOLDS = {
  WARN_USD:     5.00,
  CRITICAL_USD: 20.00,
  HALT_USD:     50.00,
} as const;
```

### Cache Discount

```typescript
export const CACHE_DISCOUNT = {
  READ_MULTIPLIER: 0.1,    // Cached reads cost 10%
  CREATE_MULTIPLIER: 1.25, // Cache creation costs 125%
} as const;
```

### Types

| Type | Description |
|------|-------------|
| `TokenRecord` | Token usage entry with cost |
| `DriftMetrics` | 5-dimension drift score |
| `MemoryEntry` | Vector memory item |
| `MemoryTag` | 10 tag categories |
| `AlertLevel` | `NONE \| WARNING \| BLOCK` |
| `OverallHealth` | `HEALTHY \| WARNING \| CRITICAL` |
| `DriftTrend` | `IMPROVING \| STABLE \| DEGRADING` |
| `ScoreObservation` | Agent scoring data point |

### Enums

```typescript
type MemoryTag = "lesson" | "pattern" | "preference" | "architecture"
  | "decision" | "bug" | "performance" | "security" | "gdpr" | "workflow";

type AlertLevel = "NONE" | "WARNING" | "BLOCK";
type OverallHealth = "HEALTHY" | "WARNING" | "CRITICAL";
type DriftTrend = "IMPROVING" | "STABLE" | "DEGRADING";
```
