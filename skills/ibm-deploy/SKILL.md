---
name: ibm-deploy
description: Generate IBM Cloud deployment configurations for IKS/OpenShift, Code Engine, and Cloud Functions
argument-hint: "<service-name> [--type=iks|codeengine|functions]"
tags: [deploy, ibm, iks, openshift, codeengine]
user-invocable: true
---

# IBM Cloud Deployment

Generate IBM Cloud deployment configuration for the given service.

## Deployment Types

### IKS / OpenShift (default)
- Kubernetes manifests for IBM Cloud Kubernetes Service or Red Hat OpenShift
- Container Registry (ICR) for images
- Secrets Manager for sensitive configuration
- Ingress with IBM Cloud ALB or OpenShift Routes
- Rolling update strategy, HPA, PodDisruptionBudget

### Code Engine
- Application or job definition with container image
- Traffic splitting for canary deployments
- Auto-scaling: min/max instances, concurrency target
- Secret and configmap bindings
- Custom domain mapping

### Cloud Functions (based on Apache OpenWhisk)
- Action deployment with runtime selection (Node.js, Python, Go, Java, PHP)
- API Gateway integration, trigger bindings (Cloudant, MQ, COS)
- Sequences for action chaining
- Package management for shared actions

## Common
- VPC: private subnets, public gateway for egress
- IAM: service IDs with granular access policies
- Secrets Manager for all sensitive configuration
- Schematics (Terraform-based) for infrastructure provisioning
- Monitoring: IBM Cloud Monitoring (Sysdig), Log Analysis (LogDNA)

## Arguments
- `<service-name>`: Service name in kebab-case
- `--type=<iks|codeengine|functions>`: Deployment target (default: iks)
