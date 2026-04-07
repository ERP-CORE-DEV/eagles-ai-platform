---
name: ruby-test
description: Generate RSpec tests for Ruby/Rails classes
argument-hint: "<class-or-file> [--type=model|request|feature|job]"
tags: [testing, ruby, rspec, rails]
user-invocable: true
---

# Generate RSpec Tests

Generate RSpec tests for the given Ruby/Rails class or file.

## What To Do

1. **Read the target file** to understand public methods, validations, associations, and dependencies
2. **Generate spec file** at the correct spec/ path
3. **Define FactoryBot factory** if one does not exist
4. **Write examples** using describe/context/it blocks with Arrange-Act-Assert
5. **Cover edge cases**: nil attributes, invalid records, boundary values, unauthorized access

## Test Types

### Model Spec (default)
- describe ModelName, type: :model
- Test validations, associations, scopes, custom methods

### Request Spec (--type=request)
- describe "GET /entities", type: :request
- Test HTTP status codes, response body, auth gates

### Feature Spec (--type=feature)
- feature "User manages entities", type: :feature
- Capybara DSL: visit, click_on, fill_in, expect(page).to have_content

### Job Spec (--type=job)
- Test enqueue with have_enqueued_job matcher
- Test perform_now behavior with mocked dependencies

## Arguments
- `<class-or-file>`: Target class name or file path
- `--type=<model|request|feature|job>`: Spec type (default: model)
