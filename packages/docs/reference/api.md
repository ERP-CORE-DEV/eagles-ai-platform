# API Reference

Complete tool reference for all 52 MCP tools across 6 servers.

## Quick Reference

### Token Tracker (11 tools)

| Tool | Description |
|------|-------------|
| `record_token_usage` | Record token consumption |
| `get_budget_status` | Check spend vs thresholds |
| `route_by_budget` | Get model recommendation |
| `get_session_cost` | Session cost with breakdown |
| `get_agent_costs` | Per-agent cost breakdown |
| `get_wave_costs` | Per-wave cost breakdown |
| `get_cost_report` | Comprehensive cost report |
| `get_model_pricing` | Full pricing table |
| `get_cost_advisory` | Optimization recommendations |
| `record_tool_metric` | Record tool performance |
| `get_tool_metrics` | Tool percentile stats |

### Provider Router (7 tools)

| Tool | Description |
|------|-------------|
| `provider_route` | Select optimal model |
| `provider_list` | List all providers |
| `provider_register` | Register new provider |
| `provider_health` | Check provider health |
| `provider_costs` | Compare provider costs |
| `provider_failover_config` | Configure error failover |
| `provider_stats` | Routing statistics |

### Vector Memory (4 tools)

| Tool | Description |
|------|-------------|
| `memory_store` | Store memory with embedding |
| `memory_search` | Semantic/keyword/hybrid search |
| `memory_forget` | GDPR-compliant deletion |
| `memory_stats` | Index health and counts |

### Drift Detector (8 tools)

| Tool | Description |
|------|-------------|
| `drift_set_requirements` | Set requirements anchor |
| `drift_checkpoint` | Record wave snapshot |
| `drift_compare` | Compute drift score |
| `drift_alert` | Get alert level |
| `drift_report` | Full session report |
| `drift_history` | Historical scores |
| `drift_trend` | Weighted trend analysis |
| `drift_reset` | Delete session data |

### Verification (12 tools)

| Tool | Description |
|------|-------------|
| `verify_output` | Assess output quality |
| `verify_score_agent` | Score agent on 5 dimensions |
| `verify_checkpoint_create` | Create state checkpoint |
| `verify_checkpoint_list` | List session checkpoints |
| `verify_checkpoint_restore` | Restore from checkpoint |
| `verify_rollback` | Rollback to latest checkpoint |
| `verify_pipeline_run` | Combined verify + score + checkpoint |
| `verify_checkpoint_findings` | Track findings per checkpoint |
| `verify_receipt_write` | Write delivery receipt |
| `verify_receipt_list` | List receipts |
| `verify_receipt_chain` | Verify receipt completeness |
| `verify_history` | Full verification history |

### Orchestrator (10 tools)

| Tool | Description |
|------|-------------|
| `agent_register` | Register agent with capabilities |
| `agent_discover` | Find agents by capability/tag |
| `agent_status` | Check agent status |
| `agent_heartbeat` | Send keepalive |
| `task_create` | Create task with dependencies |
| `task_assign` | Auto-assign to capable agent |
| `task_status` | Get task status |
| `task_results` | Get task results |
| `learn_pattern` | Record successful pattern |
| `learn_suggest` | Get pattern recommendations |

---

For detailed parameter schemas, see individual server pages:
- [Token Tracker](/mcp-servers/token-tracker)
- [Provider Router](/mcp-servers/provider-router)
- [Vector Memory](/mcp-servers/vector-memory)
- [Drift Detector](/mcp-servers/drift-detector)
- [Verification](/mcp-servers/verification)
- [Orchestrator](/mcp-servers/orchestrator)
