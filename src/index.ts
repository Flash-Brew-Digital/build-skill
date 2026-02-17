#!/usr/bin/env node

import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { log } from "@clack/prompts";
import { program } from "commander";
import pc from "picocolors";
import { getQuietInput, printSuccess, promptForInput } from "./prompts.js";
import { createSkillRepository } from "./scaffold.js";
import type { CliOptions, TemplateValues } from "./types.js";
import { getGitConfig } from "./utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = join(__dirname, "..", "template");

declare const __VERSION__: string | undefined;
const version = typeof __VERSION__ !== "undefined" ? __VERSION__ : "dev";

const BANNER = `
 _           _ _     _       _    _ _ _
| |__  _   _(_) | __| |  ___| | _(_) | |
| '_ \\| | | | | |/ _\` | / __| |/ / | | |
| |_) | |_| | | | (_| | \\__ \\   <| | | |
|_.__/ \\__,_|_|_|\\__,_| |___/_|\\_\\_|_|_|
`;

async function main() {
  program
    .name("build-skill")
    .description("Scaffold AI agent skills quickly")
    .version(version)
    .argument("[name]", "Skill name")
    .argument("[description]", "Skill description")
    .option("-b, --brand <brand>", "Brand/organization name")
    .option("-n, --name <name>", "Skill name")
    .option("-d, --description <description>", "Skill description")
    .option("-l, --license <license>", "License for the skill")
    .option("-w, --website <url>", "Website URL (e.g. docs) for the skill")
    .option("-r, --repository <repo>", "GitHub repository (owner/repo)")
    .option("-k, --keywords <keywords>", "Comma-separated keywords")
    .option("-o, --output <dir>", "Output directory", ".")
    .option("-q, --quiet", "Suppress interactive prompts and visual output")
    .option("-f, --force", "Overwrite existing directory")
    .parse();

  const options = program.opts<CliOptions>();
  const [argName, argDescription] = program.args;
  const providedBrand = options.brand;
  const providedName = options.name || argName;
  const providedDescription = options.description || argDescription;

  if (!options.quiet) {
    console.log(pc.green(BANNER));
  }

  const gitName = await getGitConfig("user.name");
  const gitEmail = await getGitConfig("user.email");

  const hasGitConfig = gitName && gitEmail;
  if (!(hasGitConfig || options.quiet)) {
    log.warn(
      "Could not detect git user.name or user.email. Using placeholders."
    );
  }

  const input = options.quiet
    ? getQuietInput(providedBrand, providedName, providedDescription)
    : await promptForInput(providedBrand, providedName, providedDescription);

  const { brandName, skillName, skillDescription } = input;
  const outputDir = resolve(process.cwd(), options.output || ".");
  const targetDir = join(outputDir, `${brandName}-skills`);

  const values: TemplateValues = {
    Brand_Name: brandName,
    Skill_Name: skillName,
    Skill_Description: skillDescription,
    Creator_Name: gitName || "Your Name",
    Creator_Email: gitEmail || "your.email@example.com",
    Skill_License: options.license || "MIT",
    Skill_Homepage: options.website || "https://example.com",
    Skill_Repository: options.repository || `${brandName}/agent-skills`,
    Skill_Keywords: JSON.stringify(
      (options.keywords || "ai, agent, skill").split(",").map((k) => k.trim())
    ),
  };

  await createSkillRepository(
    TEMPLATE_DIR,
    targetDir,
    values,
    Boolean(options.quiet),
    Boolean(options.force)
  );
  printSuccess(targetDir, brandName, skillName, Boolean(options.quiet));
}

main().catch((error) => {
  console.error(
    pc.red(
      error instanceof Error ? error.message : "An unexpected error occurred"
    )
  );
  process.exit(1);
});
