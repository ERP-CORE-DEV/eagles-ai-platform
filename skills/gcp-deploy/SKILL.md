---
name: gcp-deploy
description: Generate GCP deployment configurations for GKE, Cloud Run, and Cloud Functions
argument-hint: "<service-name> [--type=gke|cloudrun|functions]"
tags: [deploy, gcp, gke, cloudrun, functions]
user-invocable: true
---

# GCP Deployment

Generate GCP deployment configuration for the given service.

## Deployment Types

### GKE (default)
- Kubernetes manifests: Deployment, Service, Ingress (GKE Ingress)
- HPA, PodDisruptionBudget, node affinity for GPU workloads
- Artifact Registry for container images
- Secret Manager via External Secrets Operator or Workload Identity
- Rolling update with surge and unavailable settings

### Cloud Run
- Service YAML with container image, CPU/memory limits
- Traffic splitting: canary (10/90) or blue-green (0/100 switch)
- Cloud Load Balancing with custom domains
- Secret Manager volumes for sensitive config
- Min/max instances, concurrency, and request timeout

### Cloud Functions (2nd gen)
- Function source deployment (HTTP or event-triggered)
- Eventarc triggers for Pub/Sub, Cloud Storage, Firestore
- VPC connector for private network access
- Secret Manager environment binding

## Common
- VPC: private Google access, Cloud NAT for egress
- IAM: service account per service, least-privilege
- Cloud Armor for WAF/DDoS protection on public endpoints
- Cloud Monitoring: uptime checks, alerting policies, SLO definitions
- Secret Manager for all sensitive configuration

## Arguments
- `<service-name>`: Service name in kebab-case
- `--type=<gke|cloudrun|functions>`: Deployment target (default: gke)
