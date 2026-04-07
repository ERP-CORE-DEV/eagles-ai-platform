---
name: mysql-review
description: Review MySQL/MariaDB schemas, queries, and configuration for performance and production readiness
agent: database-reviewer
argument-hint: "<file-or-query-or-schema>"
tags: [database, mysql, mariadb, sql, performance, indexing]
user-invocable: true
---

# MySQL / MariaDB Review

Review MySQL for query optimization, InnoDB tuning, replication, character sets, and security.

## Key Checks
- EXPLAIN FORMAT=JSON — flag type: ALL (full scan), Using filesort, Using temporary
- Composite index column order matches query left-prefix rule
- FULLTEXT indexes for LIKE '%term%', functional indexes for expressions (MySQL 8.0+)
- innodb_buffer_pool_size 70-80% RAM, innodb_flush_log_at_trx_commit, innodb_flush_method O_DIRECT
- binlog_format = ROW, GTID mode for replication, Seconds_Behind_Source monitoring
- utf8mb4 everywhere (not utf8 which is 3-byte), consistent collation across JOINs
- RANGE partitioning for dates, verify partition key in unique indexes
- No anonymous users, GRANT minimum privileges, require_secure_transport, validate_password STRONG

## Output
Severity-sorted: CRITICAL, HIGH, MEDIUM, LOW, PASSED.
