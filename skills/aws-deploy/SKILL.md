---
name: aws-deploy
description: Generate AWS deployment configurations for EKS, ECS, Lambda, and CloudFormation/CDK
argument-hint: "<service-name> [--type=eks|ecs|lambda]"
tags: [deploy, aws, eks, ecs, lambda, cloudformation]
user-invocable: true
---

# AWS Deployment

Generate AWS deployment configuration for the given service.

## Deployment Types

### EKS (default)
- Kubernetes manifests: Deployment, Service, Ingress (ALB Ingress Controller)
- HPA with CPU/memory targets, PodDisruptionBudget
- ECR image push, AWS Secrets Manager via External Secrets Operator
- Rolling update strategy with maxSurge/maxUnavailable

### ECS (Fargate)
- Task definition with container definitions, resource limits
- Service with desired count, health check, circuit breaker
- ALB target group, listener rules
- Blue-green deployment via CodeDeploy

### Lambda
- SAM template or CDK construct
- API Gateway integration (REST or HTTP API)
- Layers for shared dependencies
- Canary deployment with alias traffic shifting

## Common
- VPC configuration: private subnets for compute, public for ALB
- Security groups: least-privilege ingress/egress
- IAM roles: task/function execution role with minimum permissions
- CloudWatch alarms: 5xx rate, latency p99, error count
- Secrets Manager for sensitive configuration (not environment variables)

## Arguments
- `<service-name>`: Service name in kebab-case
- `--type=<eks|ecs|lambda>`: Deployment target (default: eks)
