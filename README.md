# Build Skill

![Flash Brew Digital OSS](https://img.shields.io/badge/Flash_Brew_Digital-OSS-6F4E37?style=for-the-badge&labelColor=E9E3DD)
![MIT License](https://img.shields.io/badge/License-MIT-6F4E37?style=for-the-badge&labelColor=E9E3DD)

Scaffold AI agent skills quickly with the Build Skill CLI. Creates a fully-configured skills repository following the [Agent Skills Specification](https://agentskills.io/specification).

## What are Agent Skills?

Agent Skills are folders of instructions, scripts, and resources that agents can discover and use to do things more accurately and efficiently. They work across any AI agent that supports the [open Agent Skills standard](https://agentskills.io).

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
- **On Push to Main**: Validates skills and syncs the README and marketplace.json

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

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test

# Lint
pnpm check

# Fix lint issues
pnpm fix

# Type check
pnpm type-check
```

## Resources

- [Agent Skills Specification](https://agentskills.io/specification)
- [Vercel Skills CLI](https://skills.sh/)
- [Validate Agent Skill](https://github.com/marketplace/actions/validate-skill)

## Contributing

Contributions are welcome! Please read our [Contributing Guide](.github/CONTRIBUTING.md) for more information.

## License

[MIT License](LICENSE.md)

## Author

[Ben Sabic](https://bensabic.ca) at [Flash Brew Digital](https://flashbrew.digital)
