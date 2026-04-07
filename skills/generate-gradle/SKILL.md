---
name: generate-gradle
description: Generate Gradle build config with multi-module support
argument-hint: "<project-name> [--modules=api,core,infra] [--kotlin-dsl]"
tags: [codegen, java, gradle, build]
user-invocable: true
---

# Generate Gradle Build Configuration

Generate a Gradle build configuration for a Java/Kotlin project.

## What To Do

1. **Root build.gradle(.kts)** with plugins, dependency management, and common config
2. **settings.gradle(.kts)** with project name and module includes
3. **Module build files** for multi-module projects
4. **gradle.properties** with JVM args and version catalog references
5. **Version catalog** (libs.versions.toml) for centralized dependency versions

## Project Types

### Single Module
- Standard Spring Boot project
- Application plugin + Spring Boot plugin
- Dependencies: spring-boot-starter-web, spring-boot-starter-data-jpa, spring-boot-starter-test

### Multi-Module (--modules=api,core,infra)
- Root project with shared configuration
- api: Controllers, DTOs, REST endpoints
- core: Domain models, services, business logic
- infra: Repository implementations, database config, external integrations
- Dependencies flow: api -> core <- infra

## Best Practices
- Use Gradle Version Catalog (libs.versions.toml) for all dependency versions
- Pin all dependency versions (no dynamic versions like 1.+ or latest.release)
- Use Kotlin DSL (.kts) for type-safe configuration (recommended)
- Configure test logging: showStandardStreams, showExceptions, showCauses
- Enable parallel execution and build cache
- Configure JaCoCo for code coverage
- Set Java toolchain (not sourceCompatibility)

## Arguments
- `<project-name>`: Project name in kebab-case
- `--modules=<list>`: Comma-separated module names for multi-module
- `--kotlin-dsl`: Use Kotlin DSL instead of Groovy (recommended)
