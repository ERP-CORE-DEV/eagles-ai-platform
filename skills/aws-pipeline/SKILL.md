---
name: aws-pipeline
description: Generate AWS CodePipeline + CodeBuild CI/CD configuration
argument-hint: "<service-name> [--deploy-target=eks|ecs|lambda]"
tags: [cicd, aws, codepipeline, codebuild]
user-invocable: true
---

# AWS CI/CD Pipeline

Generate AWS CodePipeline with CodeBuild for the given service.

## Pipeline Stages

### 1. Source
- CodeStar connection to GitHub/Bitbucket
- S3 artifact bucket for pipeline artifacts
- Branch filter: main for production, develop for staging

### 2. Build
- CodeBuild project with buildspec.yml
- Install dependencies, run linter, compile
- Run unit tests with coverage report
- Build Docker image, push to ECR
- Cache: S3 or local Docker layer cache

### 3. Test
- Integration tests against staging environment
- Security scan: Trivy for container, CodeGuru for code
- Publish test results to CodeBuild reports

### 4. Deploy
- EKS: kubectl apply via CodeBuild or Helm upgrade
- ECS: CodeDeploy blue-green with approval gate
- Lambda: SAM deploy with canary traffic shifting
- Manual approval action before production deploy

## Best Practices
- Separate buildspec files per stage (buildspec-build.yml, buildspec-test.yml)
- IAM role per CodeBuild project with least privilege
- Encrypt artifacts with KMS
- SNS notification on pipeline failure
- CloudWatch Events for pipeline monitoring

## Arguments
- `<service-name>`: Service name in kebab-case
- `--deploy-target=<eks|ecs|lambda>`: Deployment target
