# data-layer

SQLite persistence layer providing typed stores and an event bus for inter-MCP communication.

**Package**: `@eagles-ai-platform/data-layer`
**Dependencies**: shared-utils, better-sqlite3, hnswlib-node, @xenova/transformers

## Data Stores

| Store | Database | Purpose |
|-------|----------|---------|
| `TokenLedger` | token-ledger/ledger.sqlite | Token records, cost calculations |
| `EventBus` | events/eventbus.sqlite | Cross-MCP pub/sub messaging |
| `VectorStore` | vector-memory/ | HNSW vector index + SQLite metadata |
| `MemoryRepository` | vector-memory/memory.sqlite | Memory entries with TTL |
| `DriftStore` | drift-detector/drift.sqlite | Requirements, checkpoints, scores |
| `ProviderStore` | provider-router/provider.sqlite | Provider configs, routing history |
| `VerificationStore` | verification/verification.sqlite | Checkpoints, receipts, findings |
| `AgentRegistryStore` | orchestrator/orchestrator.sqlite | Agent lifecycle, heartbeats |
| `TaskStore` | orchestrator/orchestrator.sqlite | Task DAG, assignments |
| `SonaLearningStore` | orchestrator/orchestrator.sqlite | Pattern success rates |
| `ToolMetricsStore` | token-ledger/ledger.sqlite | Tool performance percentiles |
| `ToolRegistryStore` | tool-registry/ | Skills catalog persistence |

## EventBus

SQLite-backed publish/subscribe system for inter-MCP communication.

```typescript
// Publisher (e.g., token-tracker)
eventBus.publish("token.recorded", { sessionId, model, cost });

// Consumer (e.g., drift-detector)
eventBus.consume("token.recorded", (event) => {
  // Update token efficiency metric
});
```

**Key properties**:
- WAL mode for concurrent read/write
- Events persist in SQLite (survive process restarts)
- No compile-time coupling between publishers and consumers
- Synchronous processing (matches MCP stdio transport)

## resolveDataPath

All stores use a shared path resolution function:

```typescript
export function resolveDataPath(relativePath: string): string {
  const dataRoot = process.env["EAGLES_DATA_ROOT"]
    ?? join(process.cwd(), ".data");
  const fullPath = join(dataRoot, relativePath);
  // Auto-creates parent directories
  mkdirSync(dir, { recursive: true });
  return fullPath;
}
```

Set `EAGLES_DATA_ROOT` environment variable to control where all data is stored.

## VectorStore

HNSW-based vector index for semantic search:

- **Algorithm**: Hierarchical Navigable Small World (HNSW)
- **Library**: hnswlib-node
- **Dimensions**: 384 (all-MiniLM-L6-v2)
- **Query time**: ~0.5ms at 10K vectors
- **Index rebuild**: On `memory_forget` for GDPR compliance
