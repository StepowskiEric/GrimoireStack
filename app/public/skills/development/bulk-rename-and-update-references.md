# Skill: Bulk Rename Files and Update Cross-References

## Purpose

Use this skill when renaming many files or directories in a git repository where the old names appear in content (markdown links, code references, config files, documentation). Prevents broken links, stale references, and silent partial replacements.

This is common when:
- Renaming modules, components, or skills in a docs repo
- Changing naming conventions (e.g., dropping a suffix)
- Reorganizing directory structures
- Migrating from one naming scheme to another

---

## The Pattern

### Step 1: Discover and List

Find all files and directories matching the old pattern.

```python
import os

old_files = []
for root, dirs, files in os.walk('.'):
    # Skip hidden dirs
    dirs[:] = [d for d in dirs if not d.startswith('.')]
    for f in files:
        if f.endswith('-OLD-SUFFIX.ext'):
            old_files.append(os.path.join(root, f))

old_dirs = []
for root, dirs, files in os.walk('TARGET_DIR'):
    for d in list(dirs):
        if d.endswith('-OLD-SUFFIX'):
            old_dirs.append(os.path.join(root, d))
```

Print the list and verify it looks right before proceeding.

### Step 2: Verify Rename Logic

Compute target names explicitly. Check for off-by-one errors.

```python
# BAD: off-by-one — leaves trailing dash
new_base = base[:-8] + '.md'   # if stripping '-skill.md' (9 chars)

# GOOD: strip exact length
new_base = base[:-9] + '.md'   # '-skill.md' is 9 characters

# For directories:
new_base = base[:-6]           # '-skill' is 6 characters
```

Always test the slice on representative examples before running `git mv`.

### Step 3: Check for Collisions

Ensure no target name already exists.

```python
all_targets = set(new_paths)
if len(all_targets) != len(old_items):
    print("COLLISION DETECTED")
    exit(1)
```

### Step 4: Check for Substring Overlaps

If replacing names inside file content, ensure old names are not substrings of each other. If they are, sort by length descending before replacing.

```python
names = sorted(old_names, key=lambda x: -len(x))
```

This prevents `foo-skill` from being partially replaced when processing `foo-skill-state-machine`.

### Step 5: Rename with `git mv`

Use `git mv` to preserve history. Do not use `mv`.

```python
import subprocess

for old, new in renames.items():
    subprocess.run(['git', 'mv', old, new], check=True)
```

### Step 6: Update Content References

Build a replacement map and use word-boundary regex.

```python
import re

replacements = {
    'old-name-skill': 'old-name',
    # ...
}

for file_path in text_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content
    for old_name in sorted(replacements.keys(), key=lambda x: -len(x)):
        new_name = replacements[old_name]
        pattern = r'(?<![a-zA-Z0-9-])' + re.escape(old_name) + r'(?![a-zA-Z0-9-])'
        content = re.sub(pattern, new_name, content)
    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
```

The negative lookbehind/lookahead ensures you do not replace partial matches inside longer identifiers.

### Step 7: Verify

- `git status --short` should show `R` (rename) not `D` + `A`
- `git diff --stat` should show balanced insertions/deletions (ideally 1:1 for pure renames)
- Spot-check a few renamed files exist and old ones are gone
- Grep for any remaining old-name references
- Check docs and scripts that might have hardcoded paths

### Step 8: Commit and Push

```bash
git add -A
git commit -m "refactor: rename X to Y

Renamed N files and M directories.
Updated all internal references."
git push
```

---

## Pitfalls

| Pitfall | Why It Happens | Prevention |
|---------|---------------|------------|
| Off-by-one in string slice | Counting characters incorrectly | Test slice on examples before running |
| Partial replacement in content | `foo-skill` replaced inside `foo-skill-state-machine` | Sort by length descending; use word boundaries |
| `mv` instead of `git mv` | History is lost; git sees delete + create | Always use `git mv` |
| Naming collision | Target name already exists | Collision check before any rename |
| Missing references in hidden files | `.agents/`, `.github/`, etc. skipped by `os.walk` filter | Review skip logic; search with `grep -r` as backup |
| Not verifying before commit | Bug discovered after push | Run `git diff --cached --stat`; spot-check |

---

## Quick Reference

```
1. Discover    → find matching files/dirs
2. Verify logic → test slice arithmetic on examples
3. Collisions  → ensure targets do not exist
4. Sort        → by length descending for content replacement
5. git mv      → preserve history
6. Replace     → word-boundary regex in text files
7. Verify      → git status, git diff, spot checks, grep
8. Commit      → clear message with scope and count
```

---

## Related Skills

- `refactoring-state-machine` — structured refactoring protocol
- `deprecation-and-migration` — managing deprecation and migration
- `verify-before-integrate` — pre-commit verification checklist
