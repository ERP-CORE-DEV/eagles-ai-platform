---
name: generate-cargo
description: Scaffold a Cargo project with idiomatic structure and edition 2021
argument-hint: "<project-name> [--type=lib|bin|workspace]"
tags: [codegen, rust, cargo, scaffold]
user-invocable: true
---

# Generate Cargo Project

Scaffold a Rust Cargo project with idiomatic structure and Cargo best practices.

## What To Do

1. **Cargo.toml** with edition = "2021", pinned dependency versions, and [profile.release] optimizations
2. **src/lib.rs or src/main.rs** with module declaration skeleton and top-level lint attributes
3. **src/error.rs** with a thiserror-derived error type
4. **tests/ directory** with a basic integration test stub
5. **benches/ directory** with a criterion benchmark stub
6. **.cargo/config.toml** with rustflags = ["-D", "warnings"]

## Project Types

### lib (default)
- src/lib.rs re-exports the public API
- Include #![deny(missing_docs)] and #![deny(clippy::unwrap_used)]

### bin
- src/main.rs entry point with anyhow::Result return type
- Suitable for CLI tools and application binaries

### workspace
- Root Cargo.toml with [workspace] members list
- crates/{name}-core/ (lib) and crates/{name}-cli/ (bin) as initial members
- Shared [workspace.dependencies] table for version pinning

## Best Practices
- Set edition = "2021" in every Cargo.toml
- Pin dependencies to major.minor.* (e.g., serde = "1.0.*")
- Add [profile.release] with lto = true, codegen-units = 1, opt-level = 3
- Use [workspace.dependencies] to deduplicate versions across workspace members
- List thiserror for lib crates, anyhow for bin crates

## Arguments
- `<project-name>`: Crate name in snake_case (e.g., my_service, data_pipeline)
- `--type=<lib|bin|workspace>`: Project type (default: lib)
