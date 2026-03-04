# Drift Detector

5-metric requirement drift scoring system. Tracks scope creep, test health, file churn, and token efficiency across development waves.

**Package**: `@eagles-ai-platform/drift-detector-mcp`
**Tools**: 8
**Store**: `$EAGLES_DATA_ROOT/drift-detector/drift.sqlite`

## Drift Metrics

| Metric | Weight | Description |
|--------|--------|-------------|
| Requirements Coverage | 0.30 | % of checklist items addressed |
| Test Health | 0.25 | Pass rate + count vs baseline |
| File Churn | 0.15 | File diversity (spread over many files = good) |
| Token Efficiency | 0.15 | Lines of code per token consumed |
| Scope Creep | 0.15 | Unplanned vs planned files ratio |

**Composite Score** = weighted sum of all available metrics (0.0 - 1.0)

**Verdicts**: `SYNCED` (>=0.6) | `WARNING` (0.4-0.6) | `DRIFTING` (<0.4)

## Tools

### drift_set_requirements

Set the requirements anchor for a session (baseline for drift comparison).

| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| `sessionId` | string | yes | - |
| `title` | string | yes | - |
| `requirementsText` | string (min 10) | yes | - |
| `plannedFiles` | string[] | no | [] |
| `initialTestCount` | integer | no | - |
| `tokenBudget` | integer | no | - |

### drift_checkpoint

Record a snapshot of progress at a specific wave.

| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| `sessionId` | string | yes | - |
| `waveNumber` | integer | yes | - |
| `filesModified` | string[] | yes | - |
| `testsTotal` | integer | yes | - |
| `testsPassing` | integer | yes | - |
| `requirementsAddressed` | string[] | yes | - |
| `tokensConsumed` | integer | no | - |
| `linesAdded` | integer | no | - |
| `newFilesCreated` | string[] | no | [] |

### drift_compare

Compute drift score for a specific wave checkpoint.

| Parameter | Type | Required |
|-----------|------|----------|
| `sessionId` | string | yes |
| `waveNumber` | integer | yes |

**Returns**: `{ driftScore, verdict, metrics: { requirementCoverage, testHealth, fileChurn, tokenEfficiency?, scopeCreep } }`

### drift_alert

Get alert level and recommended action for a wave.

| Parameter | Type | Required |
|-----------|------|----------|
| `sessionId` | string | yes |
| `waveNumber` | integer | yes |

**Returns**: `{ alertLevel: "NONE" | "WARNING" | "BLOCK", driftScore, message, recommendedAction }`

### drift_report

Full session report with trend analysis and recommendations.

| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| `sessionId` | string | yes | - |
| `includeRecommendations` | boolean | no | true |

### drift_history

Historical drift scores for a session.

| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| `sessionId` | string | yes | - |
| `limit` | integer (1-100) | no | - |

### drift_trend

Weighted trend analysis with exponential decay.

| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| `sessionId` | string | yes | - |
| `halfLifeHours` | number | no | 24 |

**Returns**: `{ trend: "IMPROVING" | "STABLE" | "DEGRADING", velocity, weightedScore }`

### drift_reset

Delete all drift data for a session.

| Parameter | Type | Required |
|-----------|------|----------|
| `sessionId` | string | yes |
| `confirm` | boolean | yes |

::: danger
This permanently deletes all requirements, checkpoints, and scores for the session. Requires `confirm: true`.
:::
