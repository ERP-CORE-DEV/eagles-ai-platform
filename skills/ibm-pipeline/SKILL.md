---
name: ibm-pipeline
description: Generate IBM Cloud Continuous Delivery toolchain with Tekton pipelines
argument-hint: "<service-name> [--deploy-target=iks|codeengine]"
tags: [cicd, ibm, tekton, devops]
user-invocable: true
---

# IBM Cloud CI/CD Pipeline

Generate IBM Cloud Continuous Delivery toolchain configuration.

## Toolchain Components

### 1. Source
- Git Repos and Issue Tracking or GitHub integration
- Tekton trigger on push to main/develop branches
- Pipeline properties for environment configuration

### 2. Build (Tekton Tasks)
- Install dependencies, lint, compile
- Run unit tests with coverage
- Build container image, push to IBM Container Registry (ICR)
- Vulnerability Advisor scan on pushed image

### 3. Test
- Integration tests in staging namespace
- DevSecOps compliance evidence collection
- CRA (Code Risk Analyzer) for code and dependency scanning

### 4. Deploy
- IKS/OpenShift: kubectl apply or Helm upgrade
- Code Engine: ibmcloud ce application update
- Schematics workspace apply for infrastructure changes
- Manual approval gate for production

## DevSecOps Compliance
- Evidence collection at each pipeline stage
- Change management integration
- Artifact signing and provenance tracking
- Compliance dashboard with audit trail

## Arguments
- `<service-name>`: Service name in kebab-case
- `--deploy-target=<iks|codeengine>`: Deployment target
