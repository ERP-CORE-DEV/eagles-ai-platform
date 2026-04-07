---
name: oracle-review
description: Review Oracle Database schemas, queries, PL/SQL, and configuration for performance and production readiness
agent: database-reviewer
argument-hint: "<file-or-query-or-schema>"
tags: [database, oracle, sql, plsql, performance, indexing]
user-invocable: true
---

# Oracle Review

Review Oracle for explain plans, PL/SQL, partitioning, RAC, AWR/ASH, and licensing implications.

## Key Checks
- DBMS_XPLAN.DISPLAY_CURSOR for actual plans — flag FULL TABLE SCAN on large tables
- Range/hash/list/composite partitioning with partition pruning verified in plan
- PL/SQL: FORALL over row-by-row DML, BULK COLLECT with LIMIT, bind variables (no EXECUTE IMMEDIATE with string concat)
- RAC: cache contention waits (gc buffer busy), sequence CACHE+NOORDER, SCAN listener
- AWR Top 5 events, ASH blocking sessions, SQL ordered by Elapsed Time
- SQL Plan Baselines over optimizer hints, hints documented when necessary
- Bind variables verified via V$SQL VERSION_COUNT
- Materialized views: REFRESH FAST eligibility, QUERY REWRITE enabled
- Licensing audit: flag Enterprise-only features (partitioning, RAC, Advanced Compression, TDE)
- SYS/SYSTEM not used by app, TDE for PII tablespaces, AUDIT policies active

## Output
Severity-sorted: CRITICAL, HIGH, MEDIUM, LOW, PASSED.
