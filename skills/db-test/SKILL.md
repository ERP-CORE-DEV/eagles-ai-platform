---
name: db-test
description: Guide database testing with Testcontainers across all languages, fixtures, seeding, cleanup, and CI
argument-hint: "<repository-name> [--provider=cosmosdb|postgres|mysql|mongodb|redis]"
tags: [testing, database, testcontainers, integration]
user-invocable: true
---

# Database Integration Tests

Generate integration tests using Testcontainers for real database validation.

## Testcontainers by Language

### .NET
```csharp
public class CandidateRepositoryTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _container = new PostgreSqlBuilder()
        .WithImage("postgres:16-alpine").Build();
    public async Task InitializeAsync() => await _container.StartAsync();
    public async Task DisposeAsync() => await _container.DisposeAsync();
}
```

### Java
```java
@Testcontainers
class UserRepositoryTests {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");
}
```

### Node.js / TypeScript
```typescript
import { PostgreSqlContainer } from '@testcontainers/postgresql';
let container: StartedPostgreSqlContainer;
beforeAll(async () => { container = await new PostgreSqlContainer().start(); });
afterAll(async () => { await container.stop(); });
```

### Go
```go
container, _ := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
    ContainerRequest: testcontainers.ContainerRequest{
        Image: "postgres:16-alpine", ExposedPorts: []string{"5432/tcp"},
    }, Started: true,
})
```

## Strategies
- Transaction rollback: wrap test, rollback after (fastest)
- Truncate: RESTART IDENTITY CASCADE between tests
- Fixtures: Object Mother + Builder patterns, Faker for realistic data
- CI: Docker services with health checks, migrations before tests
- Single-entity reads must complete in < 100ms under test load

## Arguments
- `<repository-name>`: Repository class to test
- `--provider=<cosmosdb|postgres|mysql|mongodb|redis>`: Database provider
