---
name: gcp-pipeline
description: Generate GCP Cloud Build CI/CD configuration
argument-hint: "<service-name> [--deploy-target=gke|cloudrun]"
tags: [cicd, gcp, cloudbuild]
user-invocable: true
---

# GCP Cloud Build Pipeline

Generate GCP Cloud Build configuration for the given service.

## Pipeline Steps

### 1. Build
- cloudbuild.yaml with build steps
- Install dependencies, lint, compile
- Run unit tests with coverage
- Build container image, push to Artifact Registry
- Kaniko cache for faster Docker builds

### 2. Test
- Integration tests against staging
- Container scanning with Binary Authorization
- Publish test results

### 3. Deploy
- GKE: gcloud container clusters get-credentials + kubectl apply
- Cloud Run: gcloud run deploy with traffic splitting
- Cloud Deploy: delivery pipeline with promotion stages

## Best Practices
- Substitution variables for environment-specific config
- Service account per build trigger with least privilege
- Cloud KMS for secret decryption in build steps
- Pub/Sub notification on build failure
- Build approval via Cloud Deploy promotion

## Arguments
- `<service-name>`: Service name in kebab-case
- `--deploy-target=<gke|cloudrun>`: Deployment target
