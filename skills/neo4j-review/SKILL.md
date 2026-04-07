---
name: neo4j-review
description: Review Neo4j graph models, Cypher queries, indexes, and configuration for performance
agent: database-reviewer
argument-hint: "<cypher-query-or-schema>"
tags: [database, neo4j, graph, cypher, performance]
user-invocable: true
---

# Neo4j Review

Review Neo4j for Cypher optimization, indexes, graph modeling, APOC, GDS algorithms, and memory configuration.

## Key Checks
- PROFILE for actual stats — flag ALL_NODES_SCAN, FILTER after scan, Cartesian products
- Anchor node most selective, WITH for early aggregation, OPTIONAL MATCH only when needed
- Node/property/relationship indexes, full-text for string search, composite for multi-prop
- Supernode avoidance — intermediate nodes or relationship properties for millions of edges
- Consistent relationship direction, timestamps as epoch integers not strings
- APOC: apoc.periodic.iterate for batch ops, apoc.refactor for restructuring
- GDS: gds.graph.project minimal projection, writeProperty vs mutateProperty
- Heap 8-31GB (Xms=Xmx), page cache covers working set, transaction max_size set
- LOAD CSV with PERIODIC COMMIT or IN TRANSACTIONS, MERGE for idempotent imports
- Causal cluster min 3 cores, read replicas for scaling, bookmarks for read-your-own-writes
- Authentication enabled, default password changed, RBAC, TLS, procedure allowlist

## Output
Severity-sorted: CRITICAL, HIGH, MEDIUM, LOW, PASSED.
