---
name: mongodb-review
description: Review MongoDB schemas, aggregation pipelines, indexes, and configuration for performance and production readiness
agent: database-reviewer
argument-hint: "<file-or-collection-or-pipeline>"
tags: [database, mongodb, nosql, performance, indexing]
user-invocable: true
---

# MongoDB Review

Review MongoDB for aggregation optimization, indexing (ESR rule), sharding, schema design, and security.

## Key Checks
- explain("executionStats") on pipelines — $match/$sort early, flag COLLSCAN
- Compound indexes follow ESR: Equality first, Sort second, Range last
- Text indexes for search, wildcard for dynamic schemas, TTL for expiring docs
- Shard key: high cardinality, even distribution, present in all queries; flag jumbo chunks
- Schema: embed for 1:few read-together data, reference for unbounded arrays or independent access
- Bucket pattern for time-series, outlier pattern for large arrays
- Change streams with resume tokens, sufficient oplog size (24-48h)
- w:"majority" write concern, readConcern:"majority", retryWrites:true
- Authentication enabled, TLS enforced, no root role for app, bindIp restricted

## Output
Severity-sorted: CRITICAL, HIGH, MEDIUM, LOW, PASSED.
