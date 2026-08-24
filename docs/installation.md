# Installation

Install skills from this catalog with the standard [skills CLI](https://github.com/vercel-labs/skills)
(`npx skills`). The catalog lives at `StepowskiEric/GrimoireStack` on GitHub and is
discovered automatically from the standard `skills/` container.

## Quick Start

```bash
# Preview the catalog without installing
npx skills add StepowskiEric/GrimoireStack --list

# Install every skill globally (real files in ~/.agents/skills/, no symlinks)
npx skills add StepowskiEric/GrimoireStack -g -s '*' -a cline -y

# Install a single skill
npx skills add StepowskiEric/GrimoireStack -s specter -g -y

# Install to a specific agent (creates a symlink in the agent's skills dir)
npx skills add StepowskiEric/GrimoireStack -g -a codex -y

# Copy instead of symlink (agent dir gets real files, canonical dir is skipped)
npx skills add StepowskiEric/GrimoireStack -g -a codex --copy -y
```

## Updating

Global installs from the GitHub source are recorded in `~/.agents/.skill-lock.json`.
Updates diff every installed skill against the catalog and prompt for skills that
were deleted upstream:

```bash
npx skills update -g          # update all global skills
npx skills update <skill> -g  # update one skill
```

## Removing

```bash
npx skills remove <skill> -g  # remove one global skill
npx skills remove -g          # interactive picker
npx skills ls -g              # list installed global skills
```

## Local Paths

A local checkout works as a source too:

```bash
npx skills add /path/to/GrimoireStack -g -s '*' -a cline -y
```

Note: local-path installs are not update-tracked (no lock entry). Use the GitHub
source for `npx skills update` support.

## What Gets Installed

Each skill is a directory. The CLI copies the whole directory:

```
my-skill/
├── SKILL.md       # frontmatter + instructions
├── references/    # detailed docs, loaded on demand
├── scripts/       # companion scripts (pure stdlib Python)
└── RESEARCH.md    # research basis (where present)
```

## Frontmatter

Every skill carries the standard Agent Skills frontmatter plus one extension:

```yaml
name: my-skill
description: What it does and when to use it.
disable-model-invocation: true
```

`disable-model-invocation: true` hides the skill from the model's system prompt
in Prime Agent. Users invoke it explicitly with `/skill:my-skill`. Other agents
may ignore the field or map it to their own equivalent setting.

## Prime Agent

Prime Agent reads global skills from `~/.agents/skills/`. Install to a universal
agent (`-a cline`, `-a warp`, ...) so the real files land there directly, or use
any agent and point Prime Agent at the canonical directory:

```json
// ~/.prime/agent/settings.json
{
  "skills": ["~/.agents/skills"]
}
```
