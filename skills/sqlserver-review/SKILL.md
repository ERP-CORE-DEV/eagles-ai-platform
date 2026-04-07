---
name: sqlserver-review
description: Review SQL Server schemas, queries, and configuration for performance and production readiness
agent: database-reviewer
argument-hint: "<file-or-query-or-schema>"
tags: [database, sqlserver, mssql, sql, performance, indexing]
user-invocable: true
---

# SQL Server Review

Review SQL Server for execution plans, index tuning, tempdb, Always On AG, Query Store, and security.

## Key Checks
- Actual execution plans — flag Key Lookup, Hash Match spills, Implicit Conversion warnings
- Clustered index: narrow, unique, ever-increasing; nonclustered columnstore for analytics
- sys.dm_db_missing_index_details hints, dm_db_index_usage_stats for unused indexes
- tempdb: multiple data files (up to 8), pre-sized to avoid auto-growth
- Always On: synchronous-commit same DC only, async for cross-region
- Query Store enabled, regressed query identification, plan forcing for parameter sniffing
- Parameter sniffing: OPTION (OPTIMIZE FOR UNKNOWN) or statement-level RECOMPILE
- AUTO_UPDATE_STATISTICS ON, FULLSCAN after large data loads
- DMV monitoring: dm_exec_requests, dm_os_wait_stats, dm_io_virtual_file_stats
- sa disabled, TRUSTWORTHY OFF, Always Encrypted for PII columns

## Output
Severity-sorted: CRITICAL, HIGH, MEDIUM, LOW, PASSED.
