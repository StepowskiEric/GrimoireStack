# Skill: Developing Skills with Supporting Files

## Purpose

Document the complete workflow for creating and installing skills that have supporting files beyond the main `.md` file — such as Python scripts, templates, reference documents, or configuration files.

Based on the experience of developing the `keyword-agnostic-logic-locator` skill which requires two Python scripts (`extract_code_facts.py` and `query_code_facts.py`).

---

## The Problem

The `npx jerry-skills install` command has a specific behavior:

```bash
npx jerry-skills install --agent copilot --skill my-skill
```

**What it does:**
- Copies `my-skill/SKILL.md` to `~/.copilot/skills/my-skill/SKILL.md`
- **Ignores** all other files in the skill directory

**The issue:** Skills that depend on external scripts, templates, or data files will be installed incompletely, leading to runtime errors when the skill references missing files.

---

## Directory Structure Convention

For skills with supporting files, use this structure:

```
repo-root/
├── my-skill/
│   └── SKILL.md              # Main skill file (gets installed)
├── scripts/                  # Shared supporting files
│   ├── extract_code_facts.py
│   └── query_code_facts.py
├── templates/                # Template files
│   └── default-config.yaml
└── references/               # Reference documents
    └── api-spec.md
```

**Why this structure:**
- Keeps skill `.md` files focused and readable
- Allows multiple skills to share common scripts
- Makes it clear which files are skill-specific vs. shared
- Easier to manage in version control

---

## Complete Development Workflow

### Phase 1: Create the Skill

```bash
# 1. Create skill directory and main file
mkdir -p my-skill
cat > my-skill/SKILL.md << 'EOF'
---
name: my-skill
description: A skill that uses external scripts
---

# Skill: My Skill

## Purpose
...

## Usage

This skill requires the helper script:

```bash
python scripts/helper.py --input data.json
```
EOF
```

### Phase 2: Create Supporting Files

```bash
# 2. Create supporting scripts in shared location
mkdir -p scripts
cat > scripts/helper.py << 'EOF'
#!/usr/bin/env python3
"""Helper script for my-skill."""
import argparse
...
EOF

chmod +x scripts/helper.py
```

### Phase 3: Test Locally

```bash
# 3. Test scripts work from repo root
python scripts/helper.py --test

# 4. Verify skill references correct paths
# (Paths in skill should assume scripts/ is sibling to skill dir)
```

### Phase 4: Document Installation Requirements

Add this section to your skill's `.md` file:

```markdown
## Installation Notes

This skill requires supporting scripts that are **not** automatically installed by `npx jerry-skills`.

After installing the skill:

```bash
# Copy supporting scripts manually
cp repo-root/scripts/*.py ~/.copilot/skills/scripts/

# Or create symlink for development
ln -s $(pwd)/scripts ~/.copilot/skills/scripts
```
```

### Phase 5: Commit and Push

```bash
# 5. Add all files
git add my-skill/SKILL.md scripts/helper.py

# 6. Commit with clear message
git commit -m "Add my-skill with supporting helper script

Skill: my-skill/SKILL.md
Scripts: scripts/helper.py (manual copy required after install)"

# 7. Push
git push origin main
```

### Phase 6: Install and Verify

```bash
# 8. Install skill (only gets .md file)
npx jerry-skills install --agent copilot --skill my-skill

# 9. Manually copy supporting files
mkdir -p ~/.copilot/skills/scripts
cp scripts/helper.py ~/.copilot/skills/scripts/

# 10. Verify installation
ls ~/.copilot/skills/my-skill/        # Should have SKILL.md
ls ~/.copilot/skills/scripts/         # Should have helper.py

# 11. Test the skill works
cd test-project && python ~/.copilot/skills/scripts/helper.py --test
```

---

## Installation Verification Checklist

After installing any skill with supporting files:

```bash
# Check skill installed
ls ~/.copilot/skills/my-skill/SKILL.md

# Check scripts present
ls ~/.copilot/skills/scripts/helper.py

# Check scripts are executable
python ~/.copilot/skills/scripts/helper.py --help

# Test with real data (if applicable)
python ~/.copilot/skills/scripts/helper.py --input test.json
```

---

## Alternative: Self-Contained Skills

If you want fully self-contained installation, embed scripts in the skill document:

```markdown
## Setup Script

Save this as `setup.sh` and run it:

```bash
#!/bin/bash
cat > ~/.copilot/skills/scripts/helper.py << 'PYEOF'
#!/usr/bin/env python3
# [full script content here]
PYEOF
chmod +x ~/.copilot/skills/scripts/helper.py
```
```

**Trade-off:** Self-contained is easier to install but harder to maintain and version control.

---

## Real Example: Keyword-Agnostic Logic Locator

This skill demonstrates the full pattern:

**Skill file:** `execution/keyword-agnostic-logic-locator`
- References `scripts/extract_code_facts.py`
- References `scripts/query_code_facts.py`

**Supporting scripts:** `scripts/extract_code_facts.py`, `scripts/query_code_facts.py`
- 500+ lines of Python
- Tree-sitter integration
- Datalog query engine

**Installation:**
```bash
# Step 1: Install skill (gets .md only)
npx jerry-skills install --agent copilot --skill keyword-agnostic-logic-locator

# Step 2: Manual script copy
mkdir -p ~/.copilot/skills/scripts
cp scripts/extract_code_facts.py scripts/query_code_facts.py ~/.copilot/skills/scripts/

# Step 3: Verify
python ~/.copilot/skills/scripts/extract_code_facts.py --help
```

---

## Anti-Patterns

**Don't:**
- Assume `npx jerry-skills install` copies everything
- Put scripts in skill subdirectory (they won't be found)
- Use relative paths like `./script.py` in skill docs (breaks after install)
- Forget to document the manual copy step

**Do:**
- Use absolute paths in skill documentation: `~/.copilot/skills/scripts/script.py`
- Document the manual installation requirement prominently
- Provide copy-paste commands for users
- Consider creating a setup script for complex installations

---

## Quick Reference

| Task | Command |
|------|---------|
| Install skill (gets .md) | `npx jerry-skills install --agent copilot --skill my-skill` |
| Copy supporting scripts | `cp scripts/*.py ~/.copilot/skills/scripts/` |
| Verify skill installed | `ls ~/.copilot/skills/my-skill/` |
| Verify scripts present | `ls ~/.copilot/skills/scripts/` |
| Test script works | `python ~/.copilot/skills/scripts/script.py --help` |

---

## See Also

- `arxiv` skill — for researching papers that inspire new skills
- `writing-plans` skill — for planning multi-step skill development
- `refactor-cleanup` skill — for organizing skill code
