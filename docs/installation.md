# Installation

Install skills directly to your agent's configuration directory using `npx`:

## Quick Start

```bash
# Interactive picker — select agent and skills from a menu
npx grimoirestack install

# Install all skills to a specific agent
npx grimoirestack install --agent copilot
npx grimoirestack install --agent codex
npx grimoirestack install --agent hermes
npx grimoirestack install --agent claude
npx grimoirestack install --agent antigravity

# Install only specific skills (repeat --skill for multiple)
npx grimoirestack install --agent copilot --skill checklist-manifesto
npx grimoirestack install --agent codex --skill how-to-solve-it-state-machine --skill ooda-loop-state-machine

# Partial name matching works too
npx grimoirestack install --agent claude --skill "six-thinking"

# Install to all supported agents
npx grimoirestack install --all

# List available skills without installing
npx grimoirestack list
```

## Default Install Paths

```bash
npx GrimoireStack install --agent codex       # → ~/.agents/skills/
npx GrimoireStack install --agent hermes      # → ~/.hermes/skills/
npx GrimoireStack install --agent claude      # → ~/.claude/skills/
npx GrimoireStack install --agent antigravity # → ~/.antigravity/skills/
npx GrimoireStack install --agent copilot     # → ~/.copilot/skills/ (VS Code Copilot)
```

## Custom Destinations

To make skills show up in a Codex repository workspace, install them into the repo-local Team Config path:

```bash
npx GrimoireStack install --agent codex --dest .agents/skills
```

Use any custom destination:

```bash
npx GrimoireStack install --agent codex --dest /path/to/custom/dir
```

## How It Works

Each command copies every skill into a folder bundle with a `SKILL.md` file. Each bundle includes `name`, `description`, and `source: "GrimoireStack"` frontmatter so skills are discoverable and identifiable in the skills picker.

For example, `execution/how-to-solve-it-state-machine` installs to `execution/how-to-solve-it-state-machine/SKILL.md` under the target directory.

## VS Code Copilot

These skills use the [Agent Skills open standard](https://agentskills.io), which VS Code Copilot supports natively. Installing to `~/.copilot/skills/` makes them available as personal skills across all your VS Code workspaces.

```bash
# Install all skills for VS Code Copilot
npx GrimoireStack install --agent copilot

# Or pick specific skills
npx GrimoireStack install --agent copilot --skill checklist-manifesto --skill first-principles

# Then in VS Code, type /skills in chat to verify they appear
```

After installation, skills are loaded on-demand by Copilot when relevant to your task. You can manage them via the Chat Customizations editor (gear icon in the Chat view) or by typing `/skills` in the chat input.

Note: VS Code Copilot requires skills to be in flat directories directly under the skills folder. The installer automatically uses a flat structure for `--agent copilot` (e.g. `~/.copilot/skills/checklist-manifesto/SKILL.md`) while keeping topic-grouped subdirectories for other agents.
