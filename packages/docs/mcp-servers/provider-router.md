# Provider Router

Multi-provider model routing with cost-based, round-robin, and latency strategies. Includes failover configuration for production resilience.

**Package**: `@eagles-ai-platform/provider-router-mcp`
**Tools**: 7
**Store**: `$EAGLES_DATA_ROOT/provider-router/provider.sqlite`

## Default Providers

| Provider | Models | Capability |
|----------|--------|-----------|
| Anthropic | haiku-4-5, sonnet-4-6, opus-4-6 | basic, standard, advanced |
| OpenAI | gpt-4o-mini, gpt-4o | basic, advanced |
| Google | gemini-1.5-flash, gemini-1.5-pro | basic, advanced |

## Tools

### provider_route

Select optimal model based on capability requirements and budget.

| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| `capabilityLevel` | `"basic" \| "standard" \| "advanced"` | yes | - |
| `maxCostUsd` | number | no | - |
| `preferredProvider` | string | no | - |
| `strategy` | `"cost-based" \| "round-robin" \| "latency-based" \| "least-loaded"` | no | "cost-based" |
| `inputTokens` | integer | yes | - |
| `outputTokens` | integer | yes | - |

**Returns**: `{ selectedProvider, selectedModel, strategy, estimatedCostUsd }`

### provider_list

List all registered providers with availability status.

**No parameters.**

### provider_register

Register a new AI provider.

| Parameter | Type | Required |
|-----------|------|----------|
| `name` | string | yes |
| `endpoint` | URL | yes |
| `apiKeyEnvVar` | string | yes |
| `models` | string[] | yes |

### provider_health

Check health and availability of a specific provider.

| Parameter | Type | Required |
|-----------|------|----------|
| `providerName` | string | yes |

### provider_costs

Compare costs across all providers for a given token count.

| Parameter | Type | Required |
|-----------|------|----------|
| `inputTokens` | integer | yes |
| `outputTokens` | integer | yes |

**Returns**: Array of estimates per provider/model with availability status.

### provider_failover_config

Get or set failover rules for error handling.

| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| `action` | `"get" \| "set"` | no | "get" |
| `errorCategory` | `"rate_limit" \| "unavailable" \| "timeout" \| "server_error" \| "unknown"` | no | - |
| `currentProvider` | string | no | - |
| `errorStatus` | integer | no | - |
| `errorCode` | string | no | - |
| `errorMessage` | string | no | - |

### provider_stats

Routing statistics over a time window.

| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| `windowDays` | integer | no | 30 |

**Returns**: `{ totalRoutings, successRate, averageCostUsd, providerBreakdown }`
