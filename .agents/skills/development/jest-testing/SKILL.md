---
name: jest-testing
description: Comprehensive guide for writing correct Jest tests covering matchers, async patterns, mocking, configuration, and React Native specifics. Use when writing Jest tests, fixing test failures, setting up Jest configuration, mocking functions/modules, testing async code, snapshot testing, or when the user mentions Jest, test assertions, test.each, jest.fn, jest.mock, or React Native testing.
---

# Jest Testing

## Quick Start

```bash
npm install --save-dev jest
```

```javascript
// sum.js
function sum(a, b) {
  return a + b;
}
module.exports = sum;

// sum.test.js
const sum = require('./sum');

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});
```

```json
// package.json
{ "scripts": { "test": "jest" } }
```

---

## 1. Matchers (Assertions)

### Exact Equality

```javascript
expect(2 + 2).toBe(4);           // Object.is (strict)
expect(data).toEqual({ one: 1 }); // deep recursive equality
expect(data).toStrictEqual({ one: 1 }); // strict (includes undefined, sparse arrays)
expect(value).not.toBe(5);        // negation
```

### Truthiness

```javascript
expect(null).toBeNull();
expect(undefined).toBeUndefined();
expect(0).toBeDefined();
expect(true).toBeTruthy();
expect(false).toBeFalsy();
```

### Numbers

```javascript
expect(value).toBeGreaterThan(3);
expect(value).toBeGreaterThanOrEqual(3.5);
expect(value).toBeLessThan(5);
expect(value).toBeLessThanOrEqual(4.5);
expect(0.1 + 0.2).toBeCloseTo(0.3); // floating point safe
```

### Strings

```javascript
expect('team').not.toMatch(/I/);
expect('Christoph').toMatch(/stop/);
```

### Arrays & Iterables

```javascript
expect(shoppingList).toContain('milk');
expect(new Set(shoppingList)).toContain('milk');
```

### Exceptions

```javascript
expect(() => compileAndroidCode()).toThrow();
expect(() => compileAndroidCode()).toThrow(Error);
expect(() => compileAndroidCode()).toThrow('you are using the wrong JDK');
expect(() => compileAndroidCode()).toThrow(/JDK/);
```

### Async Matchers

```javascript
await expect(fetchData()).resolves.toBe('peanut butter');
await expect(fetchData()).rejects.toMatch('error');
```

---

## 2. Testing Asynchronous Code

### Async/Await (Recommended)

```javascript
test('the data is peanut butter', async () => {
  const data = await fetchData();
  expect(data).toBe('peanut butter');
});
```

### Promises

```javascript
test('the data is peanut butter', () => {
  return fetchData().then(data => {
    expect(data).toBe('peanut butter');
  });
});
```

### Callbacks (Legacy)

```javascript
test('the data is peanut butter', done => {
  fetchData((error, data) => {
    if (error) return done(error);
    expect(data).toBe('peanut butter');
    done();
  });
});
```

### Critical Rules

- **Always return or await promises** — omitting `return`/`await` causes tests to complete early
- **Use `expect.assertions(1)`** to verify assertions ran (especially for rejected promises)
- **Don't mix `done()` with returned promises** — causes memory leaks

---

## 3. Setup and Teardown

### Repeating Setup

```javascript
beforeEach(() => {
  initializeCityDatabase();
});

afterEach(() => {
  clearCityDatabase();
});
```

### One-Time Setup

```javascript
beforeAll(() => {
  return initializeCityDatabase();
});

afterAll(() => {
  return clearCityDatabase();
});
```

### Scoping

```javascript
// Applies to all tests in this file
beforeEach(() => initializeCityDatabase());

describe('matching cities to foods', () => {
  // Applies only to tests in this describe block
  beforeEach(() => initializeFoodDatabase());
  
  test('Vienna <3 veal', () => {
    expect(isValidCityFoodPair('Vienna', 'Wiener Schnitzel')).toBe(true);
  });
});
```

### Execution Order

```
1. beforeAll (file)
2. beforeEach (file)
3. beforeEach (describe)
4. TEST
5. afterEach (describe)
6. afterEach (file)
7. afterAll (describe)
8. afterAll (file)
```

---

## 4. Mock Functions

### Creating Mocks

```javascript
const mockCallback = jest.fn(x => 42 + x);

forEach([0, 1], mockCallback);

// Assertions
expect(mockCallback).toHaveBeenCalled();
expect(mockCallback).toHaveBeenCalledTimes(2);
expect(mockCallback).toHaveBeenCalledWith(0);
expect(mockCallback.mock.calls[0][0]).toBe(0);
expect(mockCallback.mock.results[0].value).toBe(42);
```

### Mock Return Values

```javascript
const myMock = jest.fn();
myMock.mockReturnValueOnce(10).mockReturnValueOnce('x').mockReturnValue(true);
myMock(); // 10
myMock(); // 'x'
myMock(); // true
```

### Mock Implementations

```javascript
const myMockFn = jest.fn(cb => cb(null, true));

// Per-call
myMockFn
  .mockImplementationOnce(cb => cb(null, true))
  .mockImplementationOnce(cb => cb(null, false));

// Default
myMockFn.mockImplementation(() => 'default');
```

### Mocking Modules

```javascript
import axios from 'axios';
import Users from './users';

jest.mock('axios');

test('should fetch users', async () => {
  const users = [{ name: 'Bob' }];
  axios.get.mockResolvedValue({ data: users });
  
  const data = await Users.all();
  expect(data).toEqual(users);
});
```

### Partial Mocks

```javascript
jest.mock('../foo-bar-baz', () => {
  const originalModule = jest.requireActual('../foo-bar-baz');
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn(() => 'mocked baz'),
    foo: 'mocked foo',
  };
});
```

---

## 5. Configuration

### Basic Config

```javascript
// jest.config.js
const { defineConfig } = require('jest');

module.exports = defineConfig({
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  transform: { '^.+\\.js$': 'babel-jest' },
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setupAfterEnv.js'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.js', '!**/node_modules/**'],
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 },
  },
  clearMocks: true,
  fakeTimers: { enableGlobally: true },
});
```

### TypeScript Config

```javascript
// Option 1: ts-jest (full type checking)
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
};

// Option 2: Babel (transpilation only)
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
  ],
};
```

### React Native Config

```javascript
module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!((@)?react-native|my-project)/)',
  ],
};
```

---

## 6. React Native Testing

### Setup

React Native 0.38+ includes Jest by default via `npx @react-native-community/cli init`.

```javascript
// jest.config.js
module.exports = { preset: 'react-native' };
```

### Snapshot Testing

```javascript
import React from 'react';
import renderer from 'react-test-renderer';
import Intro from '../Intro';

test('renders correctly', () => {
  const tree = renderer.create(<Intro />).toJSON();
  expect(tree).toMatchSnapshot();
});
```

### Updating Snapshots

```bash
jest -u  # update all snapshots
```

### Mocking Native Modules

```javascript
// Simple stub
jest.mock('react-native-video', () => 'Video');

// Complex mock with propTypes
jest.mock('path/to/MyNativeComponent', () => {
  const mockComponent = require('react-native/jest/mockComponent');
  return mockComponent('path/to/MyNativeComponent');
});

// Shared mocks via setupFiles
// jest.setup.js
jest.mock('react-native-video', () => 'Video');
```

---

## 7. Common Patterns

### Data-Driven Tests

```javascript
test.each([
  [1, 1, 2],
  [1, 2, 3],
  [2, 1, 3],
])('.add(%i, %i)', (a, b, expected) => {
  expect(a + b).toBe(expected);
});

// Tagged template literal
test.each`
  a    | b    | expected
  ${1} | ${1} | ${2}
  ${1} | ${2} | ${3}
`('returns $expected when $a + $b', ({a, b, expected}) => {
  expect(a + b).toBe(expected);
});
```

### Organizing with describe

```javascript
describe('binaryStringToNumber', () => {
  describe('given an invalid binary string', () => {
    test('composed of non-numbers throws CustomError', () => {
      expect(() => binaryStringToNumber('abc')).toThrow(CustomError);
    });
  });
  
  describe('given a valid binary string', () => {
    test('returns the correct number', () => {
      expect(binaryStringToNumber('100')).toBe(4);
    });
  });
});
```

### Skipping & Todo

```javascript
test.skip('temporarily broken', () => {});     // won't run
describe.skip('broken suite', () => {});        // skip all
test.todo('future test');                       // pending reminder
test.failing('known bug', () => {               // passes when throws
  expect(5).toBe(6);
});
```

---

## 8. CLI Options

```bash
jest                          # run all tests
jest path/to/test.js          # specific file
jest --testNamePattern="name" # pattern match
jest --coverage               # coverage report
jest -u                       # update snapshots
jest --verbose                # detailed output
jest --runInBand              # no parallelism
jest --watch                  # watch mode
jest --ci                     # CI mode (no watch)
```

---

## 9. Best Practices

### AAA Pattern

```javascript
test('returns filtered list', () => {
  // Arrange
  const items = [1, 2, 3, 4, 5];
  
  // Act
  const result = items.filter(n => n > 3);
  
  // Assert
  expect(result).toEqual([4, 5]);
});
```

### Naming

```javascript
// Good: describes behavior
test('returns empty array when no items match', () => {});
test('throws error when input is null', () => {});
test('sum returns 0 when given empty array', () => {});

// Bad: vague
test('works', () => {});
```

### Isolation

- Each test should be independent
- Use `beforeEach` to reset state
- Don't rely on test execution order
- Clean up with `afterEach`

### Mocking Guidelines

- Mock external dependencies (APIs, databases, file system)
- Don't mock the module under test
- Use `jest.spyOn()` for partial mocks
- Reset mocks between tests: `jest.clearAllMocks()`

### Snapshots

- Commit snapshots to version control
- Review snapshot changes carefully in PRs
- Don't snapshot large structures — assert specific properties

---

## 10. TypeScript Setup

```bash
npm install --save-dev ts-jest @types/jest
```

```typescript
// Option A: Import from @jest/globals (recommended)
import { describe, expect, test } from '@jest/globals';

// Option B: @types/jest adds globals (no imports needed)
/// <reference types="@types/jest" />
```

---

## 11. ESLint Integration

```javascript
// eslint.config.js
import { defineConfig } from 'eslint/config';
import globals from 'globals';

export default defineConfig([{
  files: ['**/*.test.js'],
  languageOptions: {
    globals: { ...globals.jest },
  },
}]);
```

Or use `eslint-plugin-jest`:

```json
{
  "overrides": [{
    "files": ["tests/**/*"],
    "plugins": ["jest"],
    "env": { "jest/globals": true }
  }]
}
```

---

## Official Documentation

- [Getting Started](https://jestjs.io/docs/getting-started)
- [Using Matchers](https://jestjs.io/docs/using-matchers)
- [Testing Asynchronous Code](https://jestjs.io/docs/asynchronous)
- [Setup and Teardown](https://jestjs.io/docs/setup-teardown)
- [Mock Functions](https://jestjs.io/docs/mock-functions)
- [Configuration](https://jestjs.io/docs/configuration)
- [API Reference](https://jestjs.io/docs/api)
- [Testing React Native](https://jestjs.io/docs/tutorial-react-native)
