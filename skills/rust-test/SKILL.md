---
name: rust-test
description: Generate Rust tests — unit, integration, doc, property-based, and criterion benchmarks
argument-hint: "<module-or-function> [--type=unit|integration|doc|property|bench]"
tags: [testing, rust, cargo, criterion, proptest]
user-invocable: true
---

# Generate Rust Tests

Generate Rust tests for the given module or function following idiomatic cargo test conventions.

## What To Do

1. **Read the target module or function** to understand the signature, types, error variants, and edge cases
2. **Select the appropriate test type** based on the --type argument
3. **Write tests** following Arrange-Act-Assert with descriptive snake_case names
4. **Cover edge cases**: empty inputs, zero values, boundary conditions, Err variants, and panics
5. **Place output in the correct location** per the test type

## Test Types

### Unit (default — #[cfg(test)] mod)
- Add a #[cfg(test)] mod tests {} block at the bottom of the source file
- Import with use super::* to access private items
- One logical assertion per test function

### Integration (tests/ directory)
- Create tests/{feature}_test.rs at the crate root
- Only public API is accessible
- Use tempfile::tempdir() for any filesystem state

### Doc Tests (/// examples)
- Add a triple-backtick Rust example inside the /// doc comment
- Ensure every public function has at least one passing doc test

### Property-Based (proptest)
- Use the proptest::proptest! macro inside a #[cfg(test)] mod
- Define a prop_compose! strategy for complex domain types
- Assert invariants that hold for all valid inputs

### Benchmarks (criterion)
- Create benches/{name}_bench.rs at the crate root
- Use criterion_group! and criterion_main! macros
- Target the <100ms threshold for single-entity operations

## Conventions
- Test name format: {function}_{scenario}_{expected_result} (snake_case)
- Use assert_eq!(actual, expected, "description")
- Use #[should_panic(expected = "substring")] for panic verification
- Use #[tokio::test] for any test that awaits a future

## Arguments
- `<module-or-function>`: Target module path or function name
- `--type=<unit|integration|doc|property|bench>`: Test type (default: unit)
