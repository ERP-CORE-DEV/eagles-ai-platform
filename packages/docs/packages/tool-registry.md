# tool-registry

Skills catalog with 62 skills organized across 4 categories, with AND/OR prerequisite graphs and DFS cycle detection.

**Package**: `@eagles-ai-platform/tool-registry`
**Dependencies**: shared-utils
**Note**: This is a library, not an MCP server.

## Skills Catalog

### Classic Skills (26)

Core development skills from the original EAGLES platform:
- Code review, security scanning, testing
- Documentation generation, architecture design
- Build error resolution, refactoring
- Performance optimization, CI/CD

### Language Skills (14)

Language-specific code review and best practices:
- Java (Spring Boot, JPA, virtual threads)
- Rust (ownership, lifetimes, async/tokio)
- Ruby (Rails conventions, Ruby 3.x)
- PHP (Laravel, PSR-12, PHP 8.3+)
- Go (idiomatic review, concurrency)
- Python (PEP 8, type hints)
- TypeScript (strict mode, React patterns)

### Cloud Skills (10)

Cloud platform deployment and management:
- Azure (AKS, Key Vault, Cosmos DB)
- AWS (ECS, Lambda, DynamoDB)
- GCP (GKE, Cloud Run, Firestore)

### Database Skills (12)

Database-specific optimization and review:
- SQL (PostgreSQL, MySQL, SQL Server)
- NoSQL (MongoDB, DynamoDB, Cosmos DB)
- Cache (Redis patterns, TTL strategies)
- Search (Elasticsearch, mappings)

## Prerequisite Graph

Skills can declare prerequisites using AND/OR logic:

```typescript
// AND: all prerequisites must be completed
{ name: "deploy-k8s", prerequisites: ["docker-build", "helm-chart"] }

// OR: any one prerequisite suffices
{ name: "ci-pipeline", prerequisites: { or: ["github-actions", "azure-devops"] } }
```

The registry validates prerequisites using **DFS cycle detection** to prevent circular dependencies.

## Usage

```typescript
import { ToolRegistry } from "@eagles-ai-platform/tool-registry";

const registry = new ToolRegistry();

// Find skills by tag
const securitySkills = registry.findByTag("security");

// Check prerequisites
const canDeploy = registry.checkPrerequisites("deploy-k8s", completedSkills);

// Get skill details
const skill = registry.getSkill("code-review");
```
