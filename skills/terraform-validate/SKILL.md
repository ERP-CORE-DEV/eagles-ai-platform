---
name: terraform-validate
description: Validate Terraform/OpenTofu HCL, review plans, and audit state management
argument-hint: "<directory-or-file>"
tags: [iac, terraform, opentofu, validation, multi-cloud]
user-invocable: true
---

# Terraform Validation

Validate and review Terraform/OpenTofu configuration.

## What To Do

### 1. HCL Validation
- terraform fmt -check -recursive — formatting compliance
- terraform validate — syntax and provider schema validation
- tflint — extended lint rules, naming conventions, deprecated resources

### 2. Plan Review
- Review terraform plan output for unexpected changes
- Flag destroy actions on production resources
- Verify no sensitive values in plan output (use sensitive = true)
- Check resource count changes are intentional

### 3. State Management
- Verify remote backend (S3+DynamoDB, Azure Blob+Table, GCS) with locking
- Flag local state files in version control
- Review state file for sensitive data exposure
- Verify state encryption at rest

### 4. Module Design
- One resource type per module (SRP)
- Variables with type constraints and validation blocks
- Outputs for all values consumed by other modules
- Version pinning on module sources

### 5. Security
- No hardcoded credentials in .tf files
- Use data sources for existing resources (not hardcoded IDs)
- Verify provider version constraints are pinned
- Review IAM/RBAC resources for least privilege

### 6. Multi-Cloud Patterns
- Cloud-agnostic modules with provider-specific implementations
- Workspace or directory-based environment separation
- Shared variables file for cross-cloud configuration

## Arguments
- `<directory-or-file>`: Path to Terraform root module or specific .tf file
