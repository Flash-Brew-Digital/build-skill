# Architecture

> **Project**: Build Skill
> **Repository**: https://github.com/Flash-Brew-Digital/build-skill
> **Last updated**: 2026-02-10

## Overview

Build Skill is a Node.js CLI that scaffolds AI agent skill repositories following the [Agent Skills Specification](https://agentskills.io/specification.md). It copies a built-in template directory, performs placeholder substitution, and outputs a ready-to-use repository with automation for validation, syncing, and publishing.

## Project Structure

```
build-skill/
├── src/                        # CLI source (TypeScript)
│   ├── index.ts                # Entry point — arg parsing, orchestration
│   ├── types.ts                # Shared interfaces (CliOptions, TemplateValues, SkillInput)
│   ├── prompts.ts              # Interactive prompts (@clack/prompts) and validation
│   ├── scaffold.ts             # Template copying, placeholder substitution, dir renaming
│   └── utils.ts                # Helpers (normalizeName, getGitConfig)
│
├── template/                   # Scaffolding template (shipped in npm package)
│   ├── .claude-plugin/
│   │   └── marketplace.json    # Plugin marketplace metadata
│   ├── .github/workflows/
│   │   └── process-skills.yml  # CI: validate + sync skills
│   ├── scripts/
│   │   ├── add-skill.js        # Add a new skill to the generated repo
│   │   └── sync-skills.js      # Sync README, marketplace.json, and plugin.json
│   ├── skills/{Skill_Name}/    # Skill template with placeholder directory name
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json
│   │   └── SKILL.md
│   └── README.md
│
├── tests/                      # Vitest test suite
│   ├── cli.test.ts             # End-to-end CLI tests via execa
│   ├── scaffold.test.ts        # Template copying and substitution
│   ├── prompts.test.ts         # Input validation and quiet mode
│   └── utils.test.ts           # Name normalization, git config
│
├── dist/                       # Compiled output (ESM)
├── tsup.config.ts              # Bundler config (esbuild via tsup)
├── biome.jsonc                 # Linter/formatter (Biome)
└── package.json                # Node >=20, pnpm, type: module
```

## Core Components

### CLI (`src/index.ts`)

Parses arguments with `commander`, fetches git user config via `execa`, delegates to interactive or quiet mode, then calls `createSkillRepository()`. Version is injected at build time via `tsup.config.ts` (`__VERSION__` define).

### Prompts (`src/prompts.ts`)

Two input strategies:

- **Interactive** — `@clack/prompts` group with validation for brand, name, and description
- **Quiet** — validates required `--name` and `--description` flags, no TTY needed

Both produce a `SkillInput` with normalized names.

### Scaffold (`src/scaffold.ts`)

The template engine is intentionally simple:

1. **`copyDir()`** — recursive copy of the template tree
2. **`replaceInFile()`** — replaces all `{Key}` placeholders with corresponding `TemplateValues`
3. **`processDirectory()`** — walks the tree, renames directories matching `{Skill_Name}`, calls `replaceInFile()` on every file
4. **`createSkillRepository()`** — orchestrator with pre-flight checks (target doesn't exist unless `--force`), spinner UI, and cleanup on failure

### Utils (`src/utils.ts`)

- **`normalizeName()`** — lowercases, replaces spaces with hyphens, strips special characters, collapses consecutive hyphens
- **`getGitConfig()`** — reads `git config --get <key>` to auto-fill author name and email

## Placeholder System

Template files use `{Key}` placeholders that map to the `TemplateValues` interface. This works uniformly across JSON, Markdown, and YAML since it's plain string replacement. Directory names also support substitution (e.g., `skills/{Skill_Name}/` becomes `skills/my-skill/`).

| Placeholder | Example Value |
|---|---|
| `{Brand_Name}` | `acme-corp` |
| `{Skill_Name}` | `data-processor` |
| `{Skill_Description}` | `Processes CSV and JSON data files` |
| `{Creator_Name}` | `Jane Doe` |
| `{Creator_Email}` | `jane@acme.com` |
| `{Skill_License}` | `MIT` |
| `{Skill_Homepage}` | `https://acme.example.com` |
| `{Skill_Repository}` | `acme-corp/agent-skills` |
| `{Skill_Category}` | `productivity` |
| `{Skill_Keywords}` | `data, csv, json` |

## Generated Repository Automation

The scaffolded repository includes its own automation:

### GitHub Actions (`process-skills.yml`)

Three jobs triggered on changes to files under `skills/`:

1. **detect-changes** — diffs commits to find which skills changed (handles initial commits and force pushes)
2. **validate** — runs `Flash-Brew-Digital/validate-skill@v1` on each changed skill in a matrix
3. **sync** — on push to main, runs `sync-skills.js` then auto-commits via `stefanzweifel/git-auto-commit-action@v7`

### `scripts/sync-skills.js`

Discovers all skills under `skills/`, reads SKILL.md frontmatter and plugin.json, then:

1. Regenerates the skills table in README.md (between marker comments)
2. Rebuilds the `plugins` array in `.claude-plugin/marketplace.json`
3. Syncs name, description, and version back into each skill's `plugin.json`

### `scripts/add-skill.js`

Creates a new skill directory with SKILL.md and plugin.json, then invokes `sync-skills.js`.

## Dependencies

| Package | Purpose |
|---|---|
| `commander` | CLI argument parsing |
| `@clack/prompts` | Interactive terminal prompts |
| `execa` | Shell command execution (git config) |
| `picocolors` | Terminal color output |

Dev: `tsup` (bundler), `typescript`, `vitest` (tests), `biome` via `ultracite` (lint/format).

## Build & CI

- **Build**: `tsup` compiles `src/index.ts` to ESM in `dist/`, generates `.d.ts`, injects `__VERSION__`
- **Test**: `vitest` with temp directory fixtures, covers CLI e2e, scaffolding, prompts, and utils
- **Lint**: Biome via `ultracite` (`pnpm check` / `pnpm fix`)
- **PR checks** (`.github/workflows/pr-checks.yml`): type-check, lint, build, test on Node 24
- **Release** (`.github/workflows/release.yml`): release-please for versioning + npm publish with OIDC provenance

## Published Package

Only `dist/`, `template/`, and `README.md` are included in the npm package (`files` field in package.json). The `bin` entry maps `build-skill` to `dist/index.js`.

## Glossary

- **Agent Skill** — a folder of instructions and resources that AI agents can discover and use, following the [Agent Skills Specification](https://agentskills.io/specification.md)
- **SKILL.md** — the main skill file with YAML frontmatter (metadata) and markdown content (instructions)
- **plugin.json** — Claude Code plugin metadata for a single skill
- **marketplace.json** — index of all skills in a repository for Claude Code plugin discovery
