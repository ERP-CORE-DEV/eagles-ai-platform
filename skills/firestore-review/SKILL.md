---
name: firestore-review
description: Review Firestore security rules, collection structure, indexes, and queries for correctness and cost
agent: database-reviewer
argument-hint: "<rules-file-or-collection-path>"
tags: [database, firestore, firebase, nosql, gcp, performance]
user-invocable: true
---

# Firestore Review

Review Firestore for security rules, collection structure, composite indexes, listeners, offline persistence, and cost.

## Key Checks
- Security rules: no open-access (allow read, write: if true is CRITICAL), auth checks, field validation
- Subcollection vs root collection decision based on access patterns
- Composite indexes for multi-field queries, collection group indexes for cross-parent queries
- Listeners detached on unmount, query-scoped (not full collection), error callbacks
- Offline persistence configured, cache size bounded, hasPendingWrites monitored
- Batch/transaction operations: batch.commit() for multiple writes, transactions for read-then-write
- Query limits: no multi-field inequality, max 10 values in in/array-contains-any
- Cost: select() for field masks, limit() on all lists, count() over full fetch

## Output
Severity-sorted: CRITICAL, HIGH, MEDIUM, LOW, PASSED.
