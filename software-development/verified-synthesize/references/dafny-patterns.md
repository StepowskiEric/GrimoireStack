# Verified Synthesize — Supported Patterns

## Function Patterns

### Pure Functions (no side effects)

```dafny
function sum(a: seq<int>): int
  ensures sum(a) >= 0  // only if all ints are non-negative, else remove
{
  if |a| == 0 then 0 else a[0] + sum(a[1..])
}
```

### Methods with Preconditions

```dafny
method BinarySearch(a: array<int>, key: int) returns (index: int)
  requires a != null
  requires forall i, j :: 0 <= i < j < a.Length ==> a[i] <= a[j]
  ensures 0 <= index ==> index < a.Length && a[index] == key
  ensures index < 0 ==> forall i :: 0 <= i < a.Length ==> a[i] != key
```

### Loop Invariants (required for while loops)

```dafny
method Sort(a: array<int>)
  ensures forall i, j :: 0 <= i < j < a.Length ==> a[i] <= a[j]
{
  var i := 0;
  while i < a.Length
    invariant forall i, j :: 0 <= i < j < a.Length ==> a[i] <= a[j]
    invariant i <= a.Length
  {
    var j := i + 1;
    while j < a.Length && a[j] <= a[i]
      invariant forall k :: i <= k < j ==> a[k] <= a[j]
      decreases a.Length - j
    {
      j := j + 1;
    }
    i := i + 1;
  }
}
```

## Common Patterns

| Pattern | Dafny Syntax | Notes |
|---------|-------------|-------|
| Non-null | `requires x != null` | |
| Non-empty sequence | `requires \|s\| > 0` | `\|s\|` is length |
| Array sorted | `requires forall i,j :: 0 <= i < j < a.Length ==> a[i] <= a[j]` | |
| Return value named | `returns (result: int)` | |
| Exists quantifier | `exists i :: 0 <= i < n && a[i] == key` | |
| Forall quantifier | `forall i :: P(i) ==> Q(i)` | |
| Subsequence | `a[1..]` | drop first element |
| Finite map | `map[i := v]` | immutable map update |

## Error Messages and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `assertion might not hold` | Postcondition violated | Strengthen precondition, or the implementation is wrong |
| `loop invariant not maintained` | Invariant doesn't hold at iteration | Fix invariant, or fix loop body |
| `frame condition might be violated` | Assignment changed something it shouldn't | Be explicit about modifies clause |
| `assigning to immutable variable` | Trying to mutate a `const` | Use `var` for mutable variables |
| `initializing some variables` | Incomplete pattern match | Add `case _ =>` branch |

## Python-to-Dafny Quick Reference

| Python | Dafny |
|--------|-------|
| `def f(x): return x` | `function f(x: int): int { x }` |
| `if x > 0:` | `if x > 0 then` |
| `for i in range(n):` | `while i < n` + invariant |
| `a.append(x)` | `a` is `array<T>` — Dafny arrays are fixed-size, use `seq<T>` for dynamic |
| `d = {}` | `var d := map[]` |
| `len(a)` | `\|a\|` |
| `a[1:]` | `a[1..]` |
