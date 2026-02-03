import { access, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execa } from "execa";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const CLI_PATH = join(process.cwd(), "dist", "index.js");
const TEST_DIR = join(tmpdir(), "build-skill-cli-test");
const VERSION_REGEX = /^\d+\.\d+\.\d+|dev$/;

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

beforeEach(async () => {
  await rm(TEST_DIR, { recursive: true, force: true });
});

afterEach(async () => {
  await rm(TEST_DIR, { recursive: true, force: true });
});

describe("CLI integration", () => {
  it("creates a skill repository with required flags", async () => {
    const { stdout } = await execa("node", [
      CLI_PATH,
      "--name",
      "test-skill",
      "--description",
      "A test skill",
      "--quiet",
      "--output",
      TEST_DIR,
    ]);

    const targetDir = join(TEST_DIR, "test-skill-skills");
    expect(stdout.trim()).toBe(targetDir);
    expect(await pathExists(targetDir)).toBe(true);
  });

  it("creates a skill repository with brand flag", async () => {
    await execa("node", [
      CLI_PATH,
      "--brand",
      "acme-corp",
      "--name",
      "data-processor",
      "--description",
      "Processes data",
      "--quiet",
      "--output",
      TEST_DIR,
    ]);

    const targetDir = join(TEST_DIR, "acme-corp-skills");
    expect(await pathExists(targetDir)).toBe(true);

    // Verify skill directory uses skill name, not brand
    const skillDir = join(targetDir, "skills", "data-processor");
    expect(await pathExists(skillDir)).toBe(true);
  });

  it("creates correct directory structure", async () => {
    await execa("node", [
      CLI_PATH,
      "--name",
      "my-skill",
      "--description",
      "A skill",
      "--quiet",
      "--output",
      TEST_DIR,
    ]);

    const targetDir = join(TEST_DIR, "my-skill-skills");
    const entries = await readdir(targetDir);

    expect(entries).toContain("skills");
    expect(entries).toContain("scripts");
    expect(entries).toContain("README.md");
    expect(entries).toContain(".claude-plugin");
  });

  it("replaces placeholders in generated files", async () => {
    await execa("node", [
      CLI_PATH,
      "--brand",
      "acme",
      "--name",
      "my-skill",
      "--description",
      "My awesome skill",
      "--quiet",
      "--output",
      TEST_DIR,
    ]);

    const targetDir = join(TEST_DIR, "acme-skills");
    const skillMd = await readFile(
      join(targetDir, "skills", "my-skill", "SKILL.md"),
      "utf-8"
    );

    expect(skillMd).toContain("name: my-skill");
    expect(skillMd).toContain("description: My awesome skill");
  });

  it("accepts positional arguments", async () => {
    const { stdout } = await execa("node", [
      CLI_PATH,
      "pos-skill",
      "Positional description",
      "--quiet",
      "--output",
      TEST_DIR,
    ]);

    expect(stdout.trim()).toContain("pos-skill-skills");
    expect(await pathExists(join(TEST_DIR, "pos-skill-skills"))).toBe(true);
  });

  it("fails when name is missing in quiet mode", async () => {
    await expect(
      execa("node", [
        CLI_PATH,
        "--description",
        "A description",
        "--quiet",
        "--output",
        TEST_DIR,
      ])
    ).rejects.toThrow();
  });

  it("fails when description is missing in quiet mode", async () => {
    await expect(
      execa("node", [
        CLI_PATH,
        "--name",
        "test",
        "--quiet",
        "--output",
        TEST_DIR,
      ])
    ).rejects.toThrow();
  });

  it("fails when directory exists without force flag", async () => {
    // Create first
    await execa("node", [
      CLI_PATH,
      "--name",
      "test",
      "--description",
      "desc",
      "--quiet",
      "--output",
      TEST_DIR,
    ]);

    // Try to create again
    await expect(
      execa("node", [
        CLI_PATH,
        "--name",
        "test",
        "--description",
        "desc",
        "--quiet",
        "--output",
        TEST_DIR,
      ])
    ).rejects.toThrow();
  });

  it("overwrites directory with force flag", async () => {
    // Create first
    await execa("node", [
      CLI_PATH,
      "--name",
      "test",
      "--description",
      "original",
      "--quiet",
      "--output",
      TEST_DIR,
    ]);

    // Create again with force
    await execa("node", [
      CLI_PATH,
      "--name",
      "test",
      "--description",
      "updated",
      "--quiet",
      "--force",
      "--output",
      TEST_DIR,
    ]);

    const skillMd = await readFile(
      join(TEST_DIR, "test-skills", "skills", "test", "SKILL.md"),
      "utf-8"
    );
    expect(skillMd).toContain("description: updated");
  });

  it("applies custom license", async () => {
    await execa("node", [
      CLI_PATH,
      "--name",
      "test",
      "--description",
      "desc",
      "--license",
      "Apache-2.0",
      "--quiet",
      "--output",
      TEST_DIR,
    ]);

    const pluginJson = await readFile(
      join(
        TEST_DIR,
        "test-skills",
        "skills",
        "test",
        ".claude-plugin",
        "plugin.json"
      ),
      "utf-8"
    );
    expect(pluginJson).toContain("Apache-2.0");
  });

  it("applies custom website", async () => {
    await execa("node", [
      CLI_PATH,
      "--name",
      "test",
      "--description",
      "desc",
      "--website",
      "https://custom.example.com",
      "--quiet",
      "--output",
      TEST_DIR,
    ]);

    const pluginJson = await readFile(
      join(
        TEST_DIR,
        "test-skills",
        "skills",
        "test",
        ".claude-plugin",
        "plugin.json"
      ),
      "utf-8"
    );
    expect(pluginJson).toContain("https://custom.example.com");
  });

  it("applies custom repository", async () => {
    await execa("node", [
      CLI_PATH,
      "--name",
      "test",
      "--description",
      "desc",
      "--repository",
      "myorg/myrepo",
      "--quiet",
      "--output",
      TEST_DIR,
    ]);

    const pluginJson = await readFile(
      join(
        TEST_DIR,
        "test-skills",
        "skills",
        "test",
        ".claude-plugin",
        "plugin.json"
      ),
      "utf-8"
    );
    expect(pluginJson).toContain("myorg/myrepo");
  });

  it("applies custom category", async () => {
    await execa("node", [
      CLI_PATH,
      "--name",
      "test",
      "--description",
      "desc",
      "--category",
      "productivity",
      "--quiet",
      "--output",
      TEST_DIR,
    ]);

    const pluginJson = await readFile(
      join(
        TEST_DIR,
        "test-skills",
        "skills",
        "test",
        ".claude-plugin",
        "plugin.json"
      ),
      "utf-8"
    );
    expect(pluginJson).toContain("productivity");
  });

  it("applies custom keywords", async () => {
    await execa("node", [
      CLI_PATH,
      "--name",
      "test",
      "--description",
      "desc",
      "--keywords",
      "custom, keywords, here",
      "--quiet",
      "--output",
      TEST_DIR,
    ]);

    const pluginJson = await readFile(
      join(
        TEST_DIR,
        "test-skills",
        "skills",
        "test",
        ".claude-plugin",
        "plugin.json"
      ),
      "utf-8"
    );
    expect(pluginJson).toContain("custom, keywords, here");
  });

  it("normalizes name with spaces", async () => {
    const { stdout } = await execa("node", [
      CLI_PATH,
      "--name",
      "My Awesome Skill",
      "--description",
      "desc",
      "--quiet",
      "--output",
      TEST_DIR,
    ]);

    expect(stdout.trim()).toContain("my-awesome-skill-skills");
  });

  it("normalizes brand with uppercase", async () => {
    await execa("node", [
      CLI_PATH,
      "--brand",
      "ACME Corp",
      "--name",
      "test",
      "--description",
      "desc",
      "--quiet",
      "--output",
      TEST_DIR,
    ]);

    expect(await pathExists(join(TEST_DIR, "acme-corp-skills"))).toBe(true);
  });

  it("shows version with --version flag", async () => {
    const { stdout } = await execa("node", [CLI_PATH, "--version"]);
    // Version should be a string (either semver or "dev")
    expect(stdout.trim()).toMatch(VERSION_REGEX);
  });

  it("shows help with --help flag", async () => {
    const { stdout } = await execa("node", [CLI_PATH, "--help"]);
    expect(stdout).toContain("build-skill");
    expect(stdout).toContain("--name");
    expect(stdout).toContain("--description");
  });
});
