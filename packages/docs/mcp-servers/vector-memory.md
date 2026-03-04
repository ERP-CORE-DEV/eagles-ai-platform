# Vector Memory

Semantic search over developer memory using HNSW indexing. Store, search, and forget memories with GDPR-compliant physical deletion.

**Package**: `@eagles-ai-platform/vector-memory-mcp`
**Tools**: 4
**Store**: `$EAGLES_DATA_ROOT/vector-memory/memory.sqlite` + `vectors.hnsw`
**Embedding Model**: Xenova/all-MiniLM-L6-v2 (384 dimensions, client-side)

## Tools

### memory_store

Store a new memory entry with semantic embedding.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `text` | string (1-2000) | yes | - | Memory content |
| `project` | string | yes | - | Project identifier |
| `tags` | MemoryTag[] | no | [] | Categorization tags |
| `confidence` | number (0-1) | no | 1.0 | Initial confidence score |
| `source` | string | no | "manual" | Origin of the memory |
| `ttlSeconds` | integer | no | - | Auto-expire after N seconds |

**Memory Tags**: `lesson`, `pattern`, `preference`, `architecture`, `decision`, `bug`, `performance`, `security`, `gdpr`, `workflow`

### memory_search

Search memories using semantic similarity, keyword matching, or hybrid mode.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string (1-500) | yes | - | Search query |
| `topK` | integer (1-50) | no | 5 | Max results |
| `project` | string | no | - | Filter by project |
| `tags` | MemoryTag[] | no | - | Filter by tags |
| `minScore` | number (0-1) | no | 0.3 | Minimum similarity score |
| `mode` | `"semantic" \| "keyword" \| "hybrid"` | no | "semantic" | Search strategy |

**Returns**: Array of `{ entry, score }` ranked by relevance.

### memory_forget

Permanently delete memories (GDPR Article 17 compliant).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ids` | string[] (1-100) | yes | Memory IDs to delete |
| `reason` | string | no | Deletion reason for audit |

::: warning GDPR
`memory_forget` performs **physical deletion** from both the SQLite database and the HNSW vector index. The index is rebuilt after deletion to ensure no residual vector data remains. This is not a soft delete.
:::

### memory_stats

Get memory index health and statistics.

**No parameters.**

**Returns**:
```json
{
  "totalMemories": 142,
  "indexHealth": "healthy",
  "vectorDimensionality": 384,
  "modelName": "Xenova/all-MiniLM-L6-v2",
  "modelLoaded": true,
  "vectorCount": 142,
  "byProject": { "sourcing": 80, "eagles": 62 },
  "byTag": { "pattern": 45, "lesson": 30, "architecture": 25 }
}
```

## First-Run Behavior

On first use, the embedding model (~90MB) is downloaded and cached locally. Subsequent uses are instant. The download progress is logged to stderr (not visible in MCP responses).
