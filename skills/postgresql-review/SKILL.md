---
name: postgresql-review
description: Review PostgreSQL schemas, queries, and configuration for performance and production readiness
agent: database-reviewer
argument-hint: "<file-or-query-or-schema>"
tags: [database, postgresql, sql, performance, indexing]
user-invocable: true
---

# PostgreSQL Review

Review PostgreSQL for query optimization, indexing, VACUUM, partitioning, connection pooling, and security.

## Key Checks
- EXPLAIN (ANALYZE, BUFFERS) on all non-trivial queries — flag sequential scans on large tables
- B-tree indexes on FKs/filter columns, GIN for JSONB, GiST for full-text, BRIN for append-only
- Covering indexes (INCLUDE) to eliminate heap fetches, partial indexes for selective subsets
- Unused index audit via pg_stat_user_indexes (idx_scan = 0)
- autovacuum enabled, n_dead_tup monitored, fillfactor tuned for HOT updates
- Range/list/hash partitioning with partition pruning verified in EXPLAIN
- PgBouncer in transaction mode for connection pooling
- shared_buffers 25% RAM, effective_cache_size 75%, work_mem conservative
- No SUPERUSER for app accounts, SSL enforced, RLS on multi-tenant tables

## Output
Severity-sorted: CRITICAL, HIGH, MEDIUM, LOW, PASSED.
