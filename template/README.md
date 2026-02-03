# {Brand_Name} Agent Skills

This repository contains a collection of agent skills for {Brand_Name}. These skills are designed to enhance the capabilities of agents by providing them with specialized functionalities.

## What are Agent Skills?

Agent Skills are folders of instructions, scripts, and resources that agents can discover and use to do things more accurately and efficiently. They work across any AI agent that supports the [open Agent Skills standard](https://agentskills.io).

## Available Skills
<!-- START:Available-Skills -->

| Skill | Description |
| ----- | ----------- |
| {Skill_Name} | {Skill_Description} |

<!-- END:Available-Skills -->

## Installation

### Option 1: Skills (Recommended)

Use the [Vercel Skills CLI](https://skills.sh/) to install skills directly:

```bash
# Install all skills
npx skills add {Brand_Name}/agent-skills

# Install specific skills
npx skills add {Brand_Name}/agent-skills --skill {Skill_Name}

# List available skills
npx skills add {Brand_Name}/agent-skills --list
```

### Option 2: Claude Code Plugin

Install via Claude Code's plugin system:

```bash
# Add the marketplace
/plugin marketplace add {Brand_Name}/agent-skills

# Install specific skill
/plugin install {Skill_Name}-skill
```

## Adding New Skills

Use the included script to add new skills:

```bash
node scripts/add-skill.js <skill-name> "<description>"
```

Example:

```bash
node scripts/add-skill.js {Skill_Name} "{Skill_Description}"
```

This will create the skill structure and automatically update this README and the marketplace.json.

## Scripts

| Script | Description |
| ------ | ----------- |
| `node scripts/add-skill.js` | Add a new skill to the repository |
| `node scripts/sync-skills.js` | Sync README and marketplace.json with skills directory |

## Contributing

1. Fork this repository
2. Create a new skill using `node scripts/add-skill.js`
3. Edit the skill's `SKILL.md` with your content
4. Submit a pull request

## License

{Skill_License}