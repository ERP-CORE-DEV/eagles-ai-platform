---
name: elasticsearch-review
description: Review Elasticsearch mappings, queries, index configuration, and cluster health
agent: database-reviewer
argument-hint: "<mapping-or-query-or-index-config>"
tags: [database, elasticsearch, search, performance, indexing]
user-invocable: true
---

# Elasticsearch Review

Review ES for mapping design, query DSL, analyzers, ILM, shard sizing, cluster health, and relevance tuning.

## Key Checks
- Explicit mappings (dynamic: strict), keyword vs text field types, multi-field mappings
- Nested vs object types, doc_values/index disabled for unused fields
- Filter context for non-scoring conditions (cached), flag leading wildcards and script queries
- search_after for deep pagination (not offset), bounded terms queries
- Language-specific analyzers, nGram for autocomplete, synonym deployment strategy
- ILM: hot/warm/cold/delete phases, rollover conditions, index templates
- Shard sizing: 10-50GB per shard, shards < nodes*3, plan primary count at creation
- Cluster GREEN, JVM heap 50% RAM max 32GB, GC pressure monitoring
- BM25 scoring, function_score for business signals, explain in dev only
- Bulk API for batch indexing, refresh_interval -1 during bulk, alias-based reindexing
- X-Pack security enabled, TLS, DLS/FLS for multi-tenant, audit logging

## Output
Severity-sorted: CRITICAL, HIGH, MEDIUM, LOW, PASSED.
