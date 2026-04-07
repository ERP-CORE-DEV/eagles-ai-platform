---
name: github-actions
description: Generate GitHub Actions workflow with build, test, deploy matrix
argument-hint: "<workflow-name> [--lang=dotnet|node|java|python|go|rust|ruby|php]"
tags: [cicd, github, actions, workflow]
user-invocable: true
---

# GitHub Actions Workflow

Generate a GitHub Actions workflow for the given project.

## Workflow Structure

### Build + Test
- Checkout, setup runtime, install dependencies
- Lint, compile, run unit tests with coverage
- Upload coverage report as artifact
- Matrix strategy for multiple OS/runtime versions

### Security
- Dependency audit (npm audit, dotnet list vulnerabilities, cargo audit)
- Container scan with Trivy
- SAST with CodeQL or Semgrep
- Secret scanning with Gitleaks

### Deploy
- Build and push Docker image to registry (ACR, ECR, GCR, ICR, GHCR)
- Deploy to target (AKS, EKS, GKE, Cloud Run, App Service)
- Environment protection rules with required reviewers
- Rollback on health check failure

## Best Practices
- Use pinned action versions (SHA, not @v3)
- Cache dependencies (actions/cache)
- Separate workflows for CI and CD
- Use GITHUB_TOKEN for repo operations, secrets for external
- Concurrency groups to cancel redundant runs
- Reusable workflows for shared steps across repos

## Arguments
- `<workflow-name>`: Workflow name (e.g., ci, cd, release)
- `--lang=<dotnet|node|java|python|go|rust|ruby|php>`: Language/runtime
