---
name: rust-review
description: Review Rust code for ownership, lifetime, safety, and idiomatic patterns
agent: rust-reviewer
user-invocable: true
---

Review the following Rust code for ownership correctness, lifetime validity, unsafe audit, error handling, async patterns, and clippy compliance: $ARGUMENTS. Output severity-sorted findings.
