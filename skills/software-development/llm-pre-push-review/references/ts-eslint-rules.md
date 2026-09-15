# ESLint Rules for TypeScript Review

Run these rules before falling back to manual inspection. They catch the most common AI-generated TypeScript issues.

## Core @typescript-eslint rules

```bash
npx eslint . --ext .ts,.tsx,.js,.jsx \
  --rule '@typescript-eslint/no-explicit-any: error' \
  --rule '@typescript-eslint/no-non-null-assertion: error' \
  --rule '@typescript-eslint/no-unsafe-assignment: error' \
  --rule '@typescript-eslint/no-unsafe-member-access: error' \
  --rule '@typescript-eslint/no-unsafe-call: error' \
  --rule '@typescript-eslint/no-unsafe-return: error' \
  --rule '@typescript-eslint/strict-boolean-expressions: error' \
  --rule '@typescript-eslint/no-floating-promises: error' \
  --rule '@typescript-eslint/no-misused-promises: error' \
  --rule '@typescript-eslint/await-thenable: error' \
  --rule '@typescript-eslint/no-unnecessary-condition: error' \
  --rule '@typescript-eslint/no-unnecessary-type-assertion: error' \
  --rule '@typescript-eslint/restrict-template-expressions: error' \
  --rule '@typescript-eslint/require-await: error' \
  --rule '@typescript-eslint/no-empty-function: error'
```

## Import resolution

```bash
npx eslint . --ext .ts,.tsx --rule 'import/no-unresolved: error'
```

## Security plugins (if installed)

```bash
npx eslint . --ext .ts,.tsx --plugin security
```

## False positive exceptions

- `any` in test files for mocking: acceptable with comment
- `any` in third-party type patches: acceptable if documented
- Non-null assertion on React refs inside `useEffect`: acceptable with lower severity
- `@ts-expect-error` / `@ts-ignore`: flag unless accompanied by explanation comment
- `as unknown as T`: acceptable if comment explains why

## What these rules catch

| Rule | AI failure mode |
|------|-----------------|
| `no-explicit-any` | AI uses `any` 9x more than humans |
| `no-non-null-assertion` | AI overuses `!` without guards |
| `no-unsafe-*` | AI bypasses type safety with `any`/`unknown` |
| `strict-boolean-expressions` | AI coerces values implicitly |
| `no-floating-promises` | AI forgets `await` on promises |
| `no-misused-promises` | AI passes promises to non-async handlers |
| `require-await` | AI marks functions `async` without `await` |
| `no-empty-function` | AI generates empty catch blocks |
