import {
  access,
  cp,
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import { spinner } from "@clack/prompts";
import pc from "picocolors";
import type { TemplateValues } from "./types.js";

const SKILL_NAME_PLACEHOLDER = "{Skill_Name}";

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function copyDir(src: string, dest: string): Promise<void> {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await cp(srcPath, destPath);
    }
  }
}

export async function replaceInFile(
  filePath: string,
  values: TemplateValues
): Promise<void> {
  let content = await readFile(filePath, "utf-8");

  for (const [key, value] of Object.entries(values)) {
    const placeholder = `{${key}}`;
    content = content.replaceAll(placeholder, value);
  }

  await writeFile(filePath, content, "utf-8");
}

export async function processDirectory(
  dir: string,
  values: TemplateValues
): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === SKILL_NAME_PLACEHOLDER) {
        const newPath = join(dir, values.Skill_Name);
        await rename(fullPath, newPath);
        await processDirectory(newPath, values);
      } else {
        await processDirectory(fullPath, values);
      }
    } else {
      await replaceInFile(fullPath, values);
    }
  }
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    // Provide friendlier messages for common errors
    if (error.message.includes("ENOENT")) {
      return "Template directory not found. Please reinstall build-skill.";
    }
    if (error.message.includes("EACCES")) {
      return "Permission denied. Check write permissions for the output directory.";
    }
    if (error.message.includes("ENOSPC")) {
      return "No space left on device.";
    }
    return error.message;
  }
  return "An unknown error occurred";
}

export async function createSkillRepository(
  templateDir: string,
  targetDir: string,
  values: TemplateValues,
  quiet: boolean,
  force: boolean
): Promise<void> {
  const s = quiet ? null : spinner();

  // Check if template exists
  if (!(await pathExists(templateDir))) {
    throw new Error(
      "Template directory not found. Please reinstall build-skill."
    );
  }

  // Check if target already exists
  if (await pathExists(targetDir)) {
    if (force) {
      await rm(targetDir, { recursive: true, force: true });
    } else {
      throw new Error(`Directory already exists: ${targetDir}`);
    }
  }

  s?.start(
    `Creating the ${pc.cyan(values.Brand_Name)} agent skills repository...`
  );

  try {
    await copyDir(templateDir, targetDir);
    await processDirectory(targetDir, values);
    s?.stop("Agent Skills repository created!");
  } catch (error) {
    s?.stop("Failed to create skill repository");

    // Clean up partial directory on failure
    try {
      await rm(targetDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }

    throw new Error(formatError(error));
  }
}
