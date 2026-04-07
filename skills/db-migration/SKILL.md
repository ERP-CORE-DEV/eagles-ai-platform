---
name: db-migration
description: Review and guide database migration strategies, tooling, rollback plans, and zero-downtime execution
argument-hint: "<migration-file-or-directory>"
tags: [database, migration, flyway, liquibase, schema]
user-invocable: true
---

# Database Migration

Guide migration strategies across all supported languages and frameworks.

## Tool Selection
- Java: Flyway (SQL-first) or Liquibase (multi-format, rollback support)
- .NET: EF Migrations or DbUp (SQL scripts) or Fluent Migrator
- Node.js: Prisma Migrate, Knex, or TypeORM migrations
- Python: Alembic (SQLAlchemy) or Django Migrations
- Ruby: ActiveRecord Migrations (change/up/down methods)
- PHP: Doctrine Migrations or Phinx

## Zero-Downtime (Expand-Contract)
1. Expand: add new column nullable, deploy app reading both old+new
2. Backfill: batch UPDATE in background job
3. Switch: add NOT NULL, deploy app using new column only
4. Contract: drop old column in subsequent migration

## Checks
- Every migration has rollback (compensating forward migration if tool lacks undo)
- No column drop in same release as app change
- No NOT NULL without default on existing table (locks)
- Idempotent seeds with ON CONFLICT DO NOTHING / MERGE
- Version naming: sortable prefix + descriptive name
- CI runs migrations against production schema snapshot before deploy

## Arguments
- `<migration-file-or-directory>`: Path to migration files
