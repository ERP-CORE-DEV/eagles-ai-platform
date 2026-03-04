# Verification

Output assessment, agent scoring, checkpoint management, and delivery receipt chains for quality assurance across development workflows.

**Package**: `@eagles-ai-platform/verification-mcp`
**Tools**: 12
**Store**: `$EAGLES_DATA_ROOT/verification/verification.sqlite`

## Tools

### verify_output

Assess quality and confidence of a generated output.

| Parameter | Type | Required |
|-----------|------|----------|
| `output` | string | yes |
| `expectedFormat` | string | no |
| `sourceContext` | string | no |
| `sessionId` | string | yes |

**Returns**: `{ confidence: 0-1, flags: string[], suggestedAction: "accept" | "review" | "reject" }`

### verify_score_agent

Score an agent across 5 dimensions with exponential decay.

| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| `sessionId` | string | yes | - |
| `agentId` | string | yes | - |
| `observations` | ScoreObservation[] | yes | - |
| `halfLifeHours` | number | no | - |

**ScoreObservation**:
```typescript
{
  dimension: "accuracy" | "reliability" | "consistency" | "efficiency" | "adaptability",
  value: number (0-1),
  timestamp: string (ISO 8601)
}
```

**Returns**: `{ accuracy, reliability, consistency, efficiency, adaptability, composite, riskLevel: "low" | "medium" | "high" }`

### verify_checkpoint_create

Create a state checkpoint for rollback capability.

| Parameter | Type | Required |
|-----------|------|----------|
| `sessionId` | string | yes |
| `name` | string | yes |
| `stateJson` | string | yes |
| `agentScore` | number (0-1) | no |
| `waveNumber` | integer | no |
| `buildStatus` | string | no |
| `testStatus` | string | no |
| `commitSha` | string | no |

### verify_checkpoint_list

List all checkpoints for a session.

| Parameter | Type | Required |
|-----------|------|----------|
| `sessionId` | string | yes |

### verify_checkpoint_restore

Restore state from a specific checkpoint.

| Parameter | Type | Required |
|-----------|------|----------|
| `checkpointId` | string | yes |

### verify_rollback

Roll back to the most recent checkpoint.

| Parameter | Type | Required |
|-----------|------|----------|
| `sessionId` | string | yes |

### verify_pipeline_run

Combined assessment: verify output + score agent + auto-checkpoint.

| Parameter | Type | Required |
|-----------|------|----------|
| `sessionId` | string | yes |
| `agentId` | string | yes |
| `output` | string | yes |
| `observations` | ScoreObservation[] | yes |

**Returns**: `{ assessment, agentScore, autoCheckpointCreated, checkpointId? }`

### verify_checkpoint_findings

Track findings (bugs, issues) against checkpoints.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | `"add" \| "list" \| "resolve"` | yes | Operation |
| `checkpointId` | string | yes | Target checkpoint |
| `severity` | `"P0" \| "P1" \| "P2" \| "P3"` | for add | Issue severity |
| `file` | string | for add | Affected file |
| `line` | integer | for add | Line number |
| `description` | string | for add | Finding description |
| `blocker` | boolean | for add | Blocks deployment? |
| `findingId` | string | for resolve | Finding to resolve |
| `fixCommit` | string | for resolve | Fix commit SHA |

### verify_receipt_write

Write a delivery receipt for completed agent work.

| Parameter | Type | Required |
|-----------|------|----------|
| `sessionId` | string | yes |
| `agentName` | string | yes |
| `waveNumber` | integer | yes |
| `output` | string | yes |
| `evidence` | Record | no |

### verify_receipt_list

List receipts for a session, optionally filtered by wave.

| Parameter | Type | Required |
|-----------|------|----------|
| `sessionId` | string | yes |
| `waveNumber` | integer | no |

### verify_receipt_chain

Verify all expected agents delivered receipts for a wave.

| Parameter | Type | Required |
|-----------|------|----------|
| `sessionId` | string | yes |
| `expectedAgents` | string[] | yes |
| `waveNumber` | integer | yes |

**Returns**: `{ complete: boolean, missing: string[], receipts, total }`

### verify_history

Full verification history for a session.

| Parameter | Type | Required |
|-----------|------|----------|
| `sessionId` | string | yes |
