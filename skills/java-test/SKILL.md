---
name: java-test
description: Generate JUnit5 tests with AssertJ and Mockito
argument-hint: "<class-or-method> [--type=unit|integration|controller]"
tags: [testing, java, junit5, spring-boot]
user-invocable: true
---

# Generate Java Tests

Generate JUnit5 tests for the given class or method using AssertJ assertions and Mockito mocking.

## What To Do

1. **Read the target class** to understand public methods, dependencies, and edge cases
2. **Generate test class** with @ExtendWith(MockitoExtension.class)
3. **Mock dependencies** with @Mock and inject with @InjectMocks
4. **Write tests** following Arrange-Act-Assert pattern
5. **Cover edge cases**: null inputs, empty collections, boundary values, exceptions

## Test Types

### Unit Test (default)
- @ExtendWith(MockitoExtension.class)
- Mock all dependencies with Mockito
- Test one method per test, one concept per assertion

### Integration Test (--type=integration)
- @SpringBootTest with Testcontainers
- @DynamicPropertySource for database connection
- Real database operations, no mocking
- @Transactional for auto-rollback

### Controller Test (--type=controller)
- @WebMvcTest({Controller}.class)
- MockMvc for HTTP request/response testing
- @MockBean for service dependencies
- Test status codes, response body, validation errors

## Conventions
- @DisplayName("should {expected} when {scenario}")
- @Nested inner classes for grouping by method or scenario
- @ParameterizedTest for data-driven tests
- assertThat() from AssertJ (not assertEquals)
- verify() for interaction verification
- assertThatThrownBy() for exception testing

## Arguments
- `<class-or-method>`: Target class or method name
- `--type=<unit|integration|controller>`: Test type (default: unit)
