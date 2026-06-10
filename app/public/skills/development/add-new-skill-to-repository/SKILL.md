---
name: add-new-skill-to-repository
category: development
description: Process for adding a new skill to Jerry's agent skills repository with proper documentation, installation support, and cross-platform verification.
version: 1.0
...



---

# Add New Skill to Jerry's Agent Skills Repository

## Purpose
Standardized process for contributing a new skill to the Jerry's agent skills repository that ensures:
- Proper skill structure and documentation
- Correct installation support across all target agents
- Clear separation of concise README info vs detailed documentation
- Verification that the skill installs and works correctly

## When to Use
- You have created a new skill that you want to contribute to the repository
- You need to ensure the skill will be properly installed by npx jerry-skills
- You want to maintain repository quality and consistency

## Steps

### 1. Prepare the Skill Directory
- Create the skill directory under the appropriate topic folder:
  - `debugging/` for debugging/problem-solving skills
  - `mlops/` for machine learning operations skills
  - `execution/` for how-to-do-the-work protocols
  - `judgment-and-routing/` for decision-making frameworks
  - `output-quality/` for output refinement skills
  - `systems-and-architecture/` for systems thinking skills
  - `orchestration/` for workflow control skills
- Structure: `topic/skill-name/SKILL.md`
- Ensure the skill follows the standard format with YAML frontmatter:
  ```yaml
  ___

  name: skill-name
  category: topic
  description: Clear description of what the skill does
  version: 1.0
  ___

  ```

### 2. Update Package.json for Inclusion
- Edit `package.json` to include the new topic in the "files" array:
  ```json
  "files": [
    "bin/",
    "*.md",
    "!README.md",
    "execution/*.md",
    "judgment-and-routing/*.md",
    "output-quality/*.md",
    "systems-and-architecture/*.md",
    "orchestration/*.md",
    "debugging/*.md",        // Add if new debugging skill
    "mlops/*.md"             // Add if new mlops skill
  ]
  ```

### 3. Update Installation Script Topics
- Edit `bin/install.js`:
  - Add the new topic to `TOPIC_DIRS` array:
    ```javascript
    const TOPIC_DIRS = [
      'execution',
      'judgment-and-routing',
      'output-quality',
      'systems-and-architecture',
      'orchestration',
      'debugging',           // Add if new debugging skill
      'mlops'                // Add if new mlops skill
    ];
    ```
  - Add the topic label to `TOPIC_LABELS` object:
    ```javascript
    const TOPIC_LABELS = {
      'execution': 'Execution — how-to-do-the-work protocols',
      'judgment-and-routing': 'Judgment & Routing — deciding what to do and how rigorously',
      'output-quality': 'Output Quality — improving what the agent produces',
      'systems-and-architecture': 'Systems & Architecture — thinking about structure and scale',
      'orchestration': 'Orchestration — agent coordination and workflow control',
      'debugging': 'Debugging — log trace correlation and problem solving',  // Add if new debugging skill
      'mlops': 'MLOps — local LLM tooling and model management'             // Add if new mlops skill
    };
    ```

### 4. Update README.md (Concise Information)
- **Find by Use Case section**: Add the skill to the appropriate table
  - Example for debugging: Add a row to the Debugging / Problem Solving table
  - Format: `|| Situation description | [`skill-name`](topic/skill-name) | Brief explanation of why it's best |`
- **Consider adding a new subsection** if the skill represents a new category:
  - Add after an existing section and before the next one
  - Include table header and at least one skill entry
- **Skill Catalog section**: Add the skill to the appropriate topic section
  - Format: 
    ```markdown
    ### `topic/skill-name.md` · [protocol/framework]
    **What it is:** Concise description of the skill
    **Use it when:** Key scenarios for using the skill
    **Best for:** Ideal use cases
    ```

### 5. Create Detailed Documentation (Optional but Recommended)
- For complex skills, create a detailed documentation file in `docs/`
- Name: `docs/new-skills-overview.md` (for multiple new skills) or `docs/skill-specific-name.md`
- Include:
  - Purpose and when to use
  - Detailed step-by-step workflow
  - Outputs, pitfalls, and verification checklists
  - Concrete examples
- Reference this in the README if appropriate

### 6. Version Management
- Bump the package version using semantic versioning:
  - `npm version patch` for bug fixes and small additions
  - `npm version minor` for new features
  - `npm version major` for breaking changes
- This automatically creates a git tag

### 7. Verify Installation Works
- Test in a clean environment to avoid contamination:
  ```bash
  export HOME=/tmp/test-install && mkdir -p /tmp/test-install
  node ./bin/install.js install --agent hermes --all  # Test one agent
  # OR
  node ./bin/install.js install --all                 # Test all agents
  ```
- Verify:
  - The skill appears in the list: `node ./bin/install.js list`
  - The skill installs to the correct location for each agent type
  - For copilot, verify flat structure (direct SKILL.md files)
  - For other agents, verify nested structure (topic/skill-name/SKILL.md)
- Check that the skill count increased appropriately

### 8. Prepare for Release
- Ensure all changes are committed:
  ```bash
  git add README.md package.json bin/install.js docs/ (if created) topic/skill-name/
  git commit -m "Add new skill: skill-name (brief description)"
  ```
- Push to remote repository:
  ```bash
  git push
  ```
- Publish to npm (if you have permissions):
  ```bash
  npm publish --access public
  ```

## Outputs
- Updated repository with new skill properly integrated
- Skill installable via npx jerry-skills for all supported agents
- Updated documentation (both concise in README and detailed if created)
- Version bumped and tagged
- Ready for npm publishing

## Pitfalls
- **Incorrect directory structure**: Skills must be in `topic/skill-name/SKILL.md`, not `topic/skill-name.md`
- **Missing package.json update**: Forgetting to add the topic to files array means the skill won't be published
- **Outdated installation script**: Forgetting to update TOPIC_DIRS/TOPIC_LABELS means the skill won't be categorized properly in interactive install
- **README bloat**: Putting too much detail in README instead of separate documentation file
- **Inconsistent formatting**: Not following the standard skill format with YAML frontmatter
- **Testing in wrong environment**: Not using a clean HOME directory when testing can give false positives

## Verification Checklist
- [ ] Skill directory follows `topic/skill-name/SKILL.md` structure
- [ ] Skill file has proper YAML frontmatter with name, category, description, version
- [ ] package.json files array includes the new topic (if applicable)
- [ ] bin/install.js TOPIC_DIRS includes the new topic (if applicable)
- [ ] bin/install.js TOPIC_LABELS includes the new topic label (if applicable)
- [ ] README.md updated in Find by Use Case section (added to appropriate table)
- [ ] README.md updated in Skill Catalog section (added to appropriate topic)
- [ ] Detailed documentation created in docs/ if skill is complex (optional but recommended)
- [ ] Version bumped appropriately with npm version
- [ ] Installation verified for at least one agent type (preferably all)
- [ ] Total skill count increased by 1
- [ ] All changes committed and pushed to remote repository
- [ ] npm publish attempted (if publishing rights available)

## Example
Adding a new debugging skill called `log-trace-correlation`:

1. Created directory: `debugging/log-trace-correlation/`
2. Created file: `debugging/log-trace-correlation/SKILL.md` with proper frontmatter
3. Updated package.json: Added `"debugging/*.md"` to files array
4. Updated bin/install.js:
   - Added `'debugging'` to TOPIC_DIRS
   - Added `'debugging': 'Debugging — log trace correlation and problem solving'` to TOPIC_LABELS
5. Updated README.md:
   - Added to Debugging / Problem Solving table: `|| Hard-to-diagnose error with stack trace | [`log-trace-correlation`](debugging/log-trace-correlation) | Correlate logs and traces to source to find root cause and suggest fix |`
   - Added to Execution section in Skill Catalog with full description
6. Created detailed documentation: `docs/new-skills-overview.md`
7. Bumped version: `npm version patch` → 1.0.1
8. Verified installation: Tested with `export HOME=/tmp/test-install && node ./bin/install.js install --agent hermes --all`
9. Committed and pushed: `git add . && git commit -m "Add new skill: log-trace-correlation" && git push`
10. Attempted npm publish: `npm publish --access public` (requires auth)

This same process applies to adding skills in any topic area.
