# Semgrep Rules for TypeScript Security Review

Run these rulesets before manual inspection. They cover OWASP Top 10, secrets, and AI-specific patterns.

## Standard rulesets

```bash
# Security-focused rules
semgrep --config p/security --config p/owasp-top-ten --config p/secrets .

# TypeScript-specific rules
semgrep --config p/typescript .

# AI coding best practices
semgrep --config p/ai-best-practices .
```

## Custom rules to write

Create `semgrep.yml` in the project root for project-specific patterns:

```yaml
rules:
  - id: dangerous-innerhtml
    pattern: dangerouslySetInnerHTML={{ __html: ... }}
    message: "dangerouslySetInnerHTML requires explicit sanitization"
    severity: WARNING
    languages: [javascript, typescript]
    metadata:
      category: security
      cwe: "CWE-79"

  - id: innerhtml-assignment
    pattern: $ELEMENT.innerHTML = $CONTENT
    message: "innerHTML assignment bypasses React; use state instead"
    severity: INFO
    languages: [javascript, typescript]

  - id: empty-catch
    pattern: catch ($E) { }
    message: "Empty catch block swallows errors silently"
    severity: WARNING
    languages: [javascript, typescript]

  - id: empty-catch-arrow
    pattern: .catch(() => null)
    message: "Empty promise catch swallows errors"
    severity: WARNING
    languages: [javascript, typescript]

  - id: hardcoded-secret
    pattern-regex: (password|apiKey|secret|token|private_key)\s*[:=]\s*["'][^"']+["']
    message: "Possible hardcoded secret"
    severity: ERROR
    languages: [javascript, typescript]
    metadata:
      category: security
      cwe: "CWE-798"

  - id: eval-usage
    pattern: eval(...)
    message: "eval() is dangerous; use JSON.parse or Function constructor with caution"
    severity: ERROR
    languages: [javascript, typescript]
    metadata:
      category: security
      cwe: "CWE-95"

  - id: command-injection
    pattern: exec($CMD)
    where:
      property: CMD
      pattern: $X + $Y
    message: "Command injection risk: exec with string concatenation"
    severity: ERROR
    languages: [javascript, typescript]
    metadata:
      category: security
      cwe: "CWE-78"

  - id: path-traversal
    pattern: readFile($PATH)
    where:
      property: PATH
      pattern-not: path.resolve(...)
    message: "Path traversal risk: readFile without path.resolve"
    severity: WARNING
    languages: [javascript, typescript]
    metadata:
      category: security
      cwe: "CWE-22"

  - id: any-type
    pattern: ": any"
    message: "any type usage bypasses type safety"
    severity: WARNING
    languages: [typescript]
    metadata:
      category: maintainability

  - id: non-null-assertion
    pattern: "$X!"
    message: "Non-null assertion without guard"
    severity: WARNING
    languages: [typescript, javascript]
    metadata:
      category: maintainability
```

## CI integration

```bash
# Run all rulesets in CI
semgrep --config p/security --config p/owasp-top-ten --config p/secrets --config p/typescript --config p/ai-best-practices .
```
