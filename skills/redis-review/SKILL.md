---
name: redis-review
description: Review Redis data structures, persistence, memory, clustering, and patterns for performance and reliability
agent: database-reviewer
argument-hint: "<config-file-or-schema-or-pattern>"
tags: [database, redis, cache, performance, clustering]
user-invocable: true
---

# Redis Review

Review Redis for data structure selection, persistence, memory, pub/sub, Lua, cluster, sentinel, and security.

## Key Checks
- Data structure selection: Hash over JSON String for object access, Sorted Set for rankings, Streams over pub/sub for reliable messaging
- Persistence: hybrid (aof-use-rdb-preamble yes) recommended, appendfsync everysec balance
- maxmemory set, eviction policy matches use case (allkeys-lru for cache, noeviction for queue)
- MEMORY USAGE for large key detection, encoding audit via OBJECT ENCODING
- Pub/sub for fire-and-forget only — Streams for reliable delivery with consumer groups
- Lua scripts via EVALSHA, short-running (single-threaded blocks), KEYS array for cluster compat
- Cluster: hash tags for multi-key ops, odd master count, cluster-node-timeout tuned
- Sentinel: min 3 instances, Sentinel-aware client, down-after-milliseconds tuned
- Pipeline for batch operations (100-1000 commands), distinguish from MULTI/EXEC atomicity
- requirepass set, bind private IP, dangerous commands renamed, TLS for Redis 6+

## Output
Severity-sorted: CRITICAL, HIGH, MEDIUM, LOW, PASSED.
