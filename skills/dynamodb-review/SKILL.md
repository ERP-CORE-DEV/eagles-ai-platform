---
name: dynamodb-review
description: Review DynamoDB table design, access patterns, capacity planning, and configuration
agent: database-reviewer
argument-hint: "<table-definition-or-access-pattern>"
tags: [database, dynamodb, aws, nosql, performance]
user-invocable: true
---

# DynamoDB Review

Review DynamoDB for single-table design, GSI/LSI strategies, capacity, DAX, TTL, and Streams.

## Key Checks
- All access patterns served by Query or GetItem (flag any Scan in application code)
- Single-table design with entity-type prefixes on PK/SK
- GSI partition key: high cardinality, even distribution; sparse GSIs for subset filtering
- Capacity: on-demand for spiky, provisioned+auto-scaling for predictable (70% target)
- DAX for read-heavy microsecond-latency (eventually consistent only)
- TTL as epoch seconds, filter expired items in queries (deletion is eventual ~48h)
- Streams: idempotent processing, 24h retention, DLQ for Lambda triggers
- BatchWriteItem/BatchGetItem over individual calls, exponential backoff for UnprocessedItems
- Transactions: 2x cost, max 100 items, idempotency token for retries
- Hot partition detection via CloudWatch Contributor Insights

## Output
Severity-sorted: CRITICAL, HIGH, MEDIUM, LOW, PASSED.
