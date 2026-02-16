# Build Skill

![Flash Brew Digital OSS](https://img.shields.io/badge/Flash_Brew_Digital-OSS-6F4E37?style=for-the-badge&labelColor=E9E3DD)
![MIT License](https://img.shields.io/badge/License-MIT-6F4E37?style=for-the-badge&labelColor=E9E3DD)

[![NPM Version](https://img.shields.io/npm/v/build-skill?registry_uri=https%3A%2F%2Fregistry.npmjs.com&style=for-the-badge&logo=npm&labelColor=%23000&color=%23000)](https://www.npmjs.com/package/build-skill)
[![NPM Downloads](https://img.shields.io/npm/dy/build-skill?style=for-the-badge&logo=npm&labelColor=%23000&color=%23000)](https://www.npmjs.com/package/build-skill)

Scaffold AI agent skills quickly with **npx build-skill**. Creates a fully-configured skills repository following the [Agent Skills Specification](https://agentskills.io/specification).

<img width="2160" height="1400" fetchpriority="high" alt="Terminal screen showing an example output for when you run npx build-skill and create your agent skill" src="https://github.com/user-attachments/assets/3d8ce277-4c07-4219-9328-f924c69e625d" />

## What are Agent Skills?

Agent Skills are folders of instructions, scripts, and resources that agents can discover and use to do things more accurately and efficiently. They work across any AI agent that supports the open Agent Skills standard.

## Quick Start

```bash
npx build-skill
```

This launches an interactive prompt to configure your skill.

## Usage

### Interactive Mode

```bash
npx build-skill
```

You'll be prompted for:
- **Brand/Organization name** - Your company or project name (e.g., `acme-corp`)
- **Skill name** - Name of your first skill (e.g., `data-processor`)
- **Skill description** - What the skill does and when to use it

### Quiet Mode (CI/Scripts)

```bash
npx build-skill --name my-skill --description "Helps with X tasks" --quiet
```

### CLI Options

| Option | Alias | Description | Default |
| ------ | ----- | ----------- | ------- |
| `--brand <brand>` | `-b` | Brand/organization name | Same as `--name` |
| `--name <name>` | `-n` | Skill name | *Required in quiet mode* |
| `--description <desc>` | `-d` | Skill description | *Required in quiet mode* |
| `--license <license>` | `-l` | License for the skill | `MIT` |
| `--website <url>` | `-w` | Website/docs URL | `https://example.com` |
| `--repository <repo>` | `-r` | GitHub repository (owner/repo) | `<brand>/agent-skills` |
| `--category <category>` | `-c` | Skill category | `general` |
| `--keywords <keywords>` | `-k` | Comma-separated keywords | `ai, agent, skill` |
| `--output <dir>` | `-o` | Output directory | `.` |
| `--quiet` | `-q` | Suppress prompts and visual output | `false` |
| `--force` | `-f` | Overwrite existing directory | `false` |
| `--version` | `-V` | Show version number | |
| `--help` | `-h` | Show help | |

### Examples

```bash
# Interactive mode
npx build-skill

# Specify brand and skill name
npx build-skill --brand acme-corp --name data-processor --description "Processes data files"

# Full configuration
npx build-skill \
  --brand acme-corp \
  --name data-processor \
  --description "Processes CSV and JSON data files" \
  --license Apache-2.0 \
  --website https://acme.example.com/docs \
  --repository acme-corp/agent-skills \
  --category productivity \
  --keywords "data, csv, json, processing" \
  --quiet

# Overwrite existing directory
npx build-skill --name my-skill --description "My skill" --force --quiet
```

## Generated Structure

```
<brand>-skills/
├── .claude-plugin/
│   └── marketplace.json
├── .github/
│   └── workflows/
│       └── process-skills.yml
├── scripts/
│   ├── add-skill.js
│   └── sync-skills.js
├── skills/
│   └── <skill-name>/
│       ├── .claude-plugin/
│       │   └── plugin.json
│       └── SKILL.md
└── README.md
```

## Included Automation

### GitHub Actions Workflow

The generated repository includes a `process-skills.yml` workflow that:

- **On Pull Requests**: Validates all skills using the [Validate Agent Skill](https://github.com/marketplace/actions/validate-skill) action
- **On Push to Main**: Validates skills and syncs the README, marketplace.json, and each skill's plugin.json

### Add Skill Script

The `scripts/add-skill.js` utility creates new skills:

```bash
node scripts/add-skill.js <skill-name> "<description>"
```

Example:
```bash
node scripts/add-skill.js data-processor "Processes CSV and JSON data files"
```

This script:
- Creates the skill directory structure in `skills/`
- Generates `SKILL.md` with frontmatter
- Generates `.claude-plugin/plugin.json`
- Automatically runs sync-skills.js to update README and marketplace.json

### Sync Script

The `scripts/sync-skills.js` utility keeps your repository in sync:

```bash
node scripts/sync-skills.js
```

This script:
- Scans the `skills/` directory for all skills
- Updates the "Available Skills" table in `README.md`
- Updates the `plugins` array in `.claude-plugin/marketplace.json`

Run it after modifying skills to keep everything up to date.

## Resources

**General**

- [Agent Skills Specification](https://agentskills.io/specification)
- [Validate Agent Skill](https://github.com/marketplace/actions/validate-skill)
- [Why Use Build Skill?](https://dev.to/bensabic/i-built-npx-build-skill-heres-why-you-should-use-it-2ag6)

**Find and Install Agent Skills**
- [npx skills](https://skills.sh/)
- [Playbooks](https://playbooks.com/skills)
- [Context7 Skills](https://context7.com/docs/skills)

## Contributing

Contributions are welcome! Please read our [Contributing Guide](.github/CONTRIBUTING.md) for more information.

## License

[MIT License](LICENSE)

## Author

[Ben Sabic](https://bensabic.dev) at [Flash Brew Digital](https://flashbrew.digital)
