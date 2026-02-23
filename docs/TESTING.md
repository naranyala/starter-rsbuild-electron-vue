# Testing Guide

## Overview

This project uses **Bun's built-in testing framework** for fast, efficient testing of both Electron main process and Vue renderer process code.

## Quick Start

```bash
# Run all tests
bun test

# Run tests in watch mode (auto-rerun on changes)
bun test --watch

# Run tests with coverage report
bun test --coverage

# Run specific test suites
bun test src/main/__tests__/      # Main process tests
bun test src/renderer/__tests__/  # Renderer process tests
bun test src/shared/__tests__/    # Shared utilities tests
bun test src/__tests__/           # Security tests
```

## Test Scripts

Available npm scripts in `package.json`:

| Script | Command | Description |
|--------|---------|-------------|
| `test` | `bun test` | Run all tests |
| `test:watch` | `bun test --watch` | Watch mode |
| `test:coverage` | `bun test --coverage` | With coverage |
| `test:main` | `bun test src/main/__tests__/` | Main process only |
| `test:renderer` | `bun test src/renderer/__tests__/` | Renderer only |
| `test:shared` | `bun test src/shared/__tests__/` | Shared utilities only |
| `test:security` | `bun run scripts/run-security-tests.ts` | Security tests |

## Test Structure

```
src/
├── __tests__/
│   └── security.test.ts          # Security-focused tests
├── main/
│   └── __tests__/
│       └── main.test.ts          # Main process tests
├── renderer/
│   └── __tests__/
│       └── renderer.test.ts      # Renderer process tests
└── shared/
    └── __tests__/
        └── shared.test.ts        # Shared utilities tests
```

## Test Categories

### 1. **Shared Tests** (`src/shared/__tests__/`)

Tests for shared utilities, types, and constants:

- **BaseError**: Error handling class tests
- **Result Type**: Functional error handling (Ok/Err pattern)
- **IPC Channels**: Channel definition tests

```bash
bun test src/shared/__tests__/
```

### 2. **Main Process Tests** (`src/main/__tests__/`)

Tests for Electron main process code:

- **Service Files**: Verify service file existence
- **Use Cases**: Business logic file structure
- **Directory Structure**: Validate project organization
- **Dependency Injection**: Container setup

```bash
bun test src/main/__tests__/
```

### 3. **Renderer Tests** (`src/renderer/__tests__/`)

Tests for Vue renderer process:

- **API Layer**: IPC communication wrappers
- **Composables**: Vue composition functions
- **Components**: Vue component existence
- **Services**: Renderer service structure
- **Stores**: Pinia store logic
- **Router**: WinBox router setup

```bash
bun test src/renderer/__tests__/
```

### 4. **Security Tests** (`src/__tests__/`)

Security-focused test suite:

- Input validation (XSS, path traversal, SSRF)
- CSP and security headers
- File system security
- Authentication/authorization
- Injection prevention (SQL, command)
- Cryptography best practices
- Electron security settings

```bash
bun test src/__tests__/security.test.ts
# or
bun run test:security
```

## Writing Tests

### Basic Test Structure

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';

describe('Feature Name', () => {
  describe('Sub-feature', () => {
    it('should do something', () => {
      const result = someFunction();
      expect(result).toBe(expectedValue);
    });

    it('should handle edge case', () => {
      expect(() => dangerousFunction()).toThrow();
    });
  });
});
```

### Testing Shared Utilities

```typescript
import { describe, it, expect } from 'bun:test';
import { BaseError } from '../errors/base.error';

describe('BaseError', () => {
  it('should create error with message', () => {
    const error = new BaseError('Something went wrong');
    expect(error.message).toBe('Something went wrong');
  });

  it('should create error with code', () => {
    const error = new BaseError('Error', { code: 'TEST_ERROR' });
    expect(error.code).toBe('TEST_ERROR');
  });
});
```

### Testing File Structure

```typescript
import { describe, it, expect } from 'bun:test';
import * as path from 'path';
import * as fs from 'fs';

describe('Directory Structure', () => {
  it('should have services directory', () => {
    const dirPath = path.join(__dirname, '../services');
    expect(fs.existsSync(dirPath)).toBe(true);
    expect(fs.statSync(dirPath).isDirectory()).toBe(true);
  });
});
```

### Testing Pure Functions

```typescript
import { describe, it, expect } from 'bun:test';

describe('Utility Functions', () => {
  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('should validate input', () => {
    expect(validateInput('valid')).toBe(true);
    expect(validateInput('')).toBe(false);
  });
});
```

## Test Configuration

Configuration is in `bunfig.toml`:

```toml
[test]
root = "./src"
pattern = "**/*.test.ts"
exclude = ["**/node_modules/**", "**/dist/**", "**/dist-ts/**", "**/build/**"]
timeout = 5000
failFast = false
concise = true
```

## Best Practices

### ✅ DO

1. **Name tests descriptively**: Use `should`, `when`, `if` patterns
2. **Test one thing per test**: Keep tests focused and atomic
3. **Use describe blocks**: Group related tests logically
4. **Test edge cases**: Null, undefined, empty strings, boundaries
5. **Mock external dependencies**: Don't test Electron APIs directly

### ❌ DON'T

1. **Don't test Electron APIs directly**: They require Electron runtime
2. **Don't write integration tests that need GUI**: Keep tests headless
3. **Don't test implementation details**: Test behavior, not internals
4. **Don't skip tests**: Fix or remove failing tests

## Testing Strategy

### What to Test

1. **Shared Utilities**: Pure functions, error classes, types
2. **Business Logic**: Use cases, services (logic only)
3. **File Structure**: Verify project organization
4. **Security**: Input validation, sanitization
5. **Configuration**: Settings, constants

### What NOT to Test

1. **Electron APIs**: BrowserWindow, dialog, etc. (require runtime)
2. **Vue Components UI**: Visual rendering (use Playwright for E2E)
3. **Third-party libraries**: Trust tested libraries
4. **Getters/Setters**: Simple property access

## Coverage

Generate coverage reports:

```bash
# Run with coverage
bun test --coverage

# View coverage in terminal
# Coverage report will be shown automatically
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: bun test

- name: Run Tests with Coverage
  run: bun test --coverage
```

## Troubleshooting

### Tests fail with "Cannot find module"

- Check import paths are relative to test file location
- Use `path.join(__dirname, '../..')` for absolute paths

### Tests fail with Electron module errors

- Don't import Electron APIs directly in tests
- Test file structure instead of Electron functionality
- Use mocks for Electron-dependent code

### Tests timeout

- Increase timeout in `bunfig.toml`
- Check for async operations that aren't awaited
- Use `it.todo()` for incomplete tests

## Extending the Test Suite

### Adding New Test Files

1. Create `*.test.ts` file in appropriate `__tests__/` directory
2. Use descriptive test names
3. Run tests to verify they work

### Testing New Features

1. Add tests in the relevant directory:
   - Main process → `src/main/__tests__/`
   - Renderer → `src/renderer/__tests__/`
   - Shared → `src/shared/__tests__/`

2. Run tests frequently during development
3. Update this guide if adding new test categories

## Migration from Other Test Frameworks

### From Jest

```typescript
// Jest
import { describe, it, expect, jest } from '@jest/globals';

// Bun
import { describe, it, expect, mock } from 'bun:test';

// jest.fn() → mock()
// jest.spyOn() → spyOn()
```

### From Vitest

```typescript
// Vitest
import { describe, it, expect, vi } from 'vitest';

// Bun
import { describe, it, expect, mock } from 'bun:test';

// vi.fn() → mock()
// vi.spyOn() → spyOn()
```

## Resources

- [Bun Test Documentation](https://bun.sh/docs/runtime/test)
- [Bun Test API Reference](https://bun.sh/docs/api/test)
- [Expect API](https://bun.sh/docs/api/expect)
