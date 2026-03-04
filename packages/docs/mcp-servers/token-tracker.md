# Token Tracker

Real-time cost tracking across all Claude Code tool calls with budget alerts and model routing recommendations.

**Package**: `@eagles-ai-platform/token-tracker-mcp`
**Tools**: 11
**Store**: `$EAGLES_DATA_ROOT/token-ledger/ledger.sqlite`

## Tools

### record_token_usage

Record token consumption for a tool call or agent invocation.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `sessionId` | string | yes | - | Session identifier |
| `modelName` | string | yes | - | Model used (e.g., `claude-opus-4-6`) |
| `promptTokens` | integer | yes | - | Input tokens consumed |
| `completionTokens` | integer | yes | - | Output tokens generated |
| `cacheReadTokens` | integer | no | 0 | Cached input tokens (0.1x cost) |
| `cacheWriteTokens` | integer | no | 0 | Cache write tokens (1.25x cost) |
| `waveNumber` | integer | no | - | Development wave number |
| `agentName` | string | no | - | Agent that made the call |
| `toolName` | string | no | - | Tool that was called |

### get_budget_status

Check current spend against budget thresholds.

| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| `windowDays` | integer | no | 30 |

**Returns**: `{ totalCostUsd, status: "ok" | "warn" | "critical" | "halt", thresholds }`

**Thresholds**: WARN=$5, CRITICAL=$20, HALT=$50

### route_by_budget

Get model recommendation based on current budget status.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `requiredCapabilityLevel` | `"basic" \| "standard" \| "advanced"` | yes | Task complexity |

### get_session_cost

Get total cost for a specific session with per-model breakdown.

| Parameter | Type | Required |
|-----------|------|----------|
| `sessionId` | string | yes |

### get_agent_costs

Get cost breakdown by agent within a session.

| Parameter | Type | Required |
|-----------|------|----------|
| `sessionId` | string | yes |

### get_wave_costs

Get cost breakdown by wave number within a session.

| Parameter | Type | Required |
|-----------|------|----------|
| `sessionId` | string | yes |

### get_cost_report

Comprehensive cost report over a time window.

| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| `windowDays` | integer | no | 30 |

**Returns**: `{ totalCost, perModel: Record, perDay: Record, averageDailyCost }`

### get_model_pricing

Returns the full pricing table for all supported models.

**No parameters.**

**Returns**:
```json
{
  "claude-opus-4-6":   { "inputPer1M": 15.00, "outputPer1M": 75.00 },
  "claude-sonnet-4-6": { "inputPer1M": 3.00,  "outputPer1M": 15.00 },
  "claude-haiku-4-5":  { "inputPer1M": 0.80,  "outputPer1M": 4.00 },
  "kimi-k2-thinking":  { "inputPer1M": 0.60,  "outputPer1M": 2.50 },
  "deepseek-r1":       { "inputPer1M": 0.55,  "outputPer1M": 2.19 },
  "deepseek-v3":       { "inputPer1M": 0.27,  "outputPer1M": 1.10 },
  "codestral-2501":    { "inputPer1M": 0.30,  "outputPer1M": 0.90 }
}
```

### get_cost_advisory

Get optimization recommendations based on usage patterns.

| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| `windowDays` | integer | no | 30 |

### record_tool_metric

Record performance metrics for a tool call.

| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| `toolName` | string | yes | - |
| `durationMs` | number | yes | - |
| `success` | boolean | no | true |
| `serverName` | string | no | "unknown" |

### get_tool_metrics

Get tool performance statistics (p50, p75, p95, p99).

| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| `toolName` | string | no | - |
| `windowDays` | integer | no | - |
| `topSlowest` | integer | no | 10 |
