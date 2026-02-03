import { describe, expect, it } from "vitest";
import { getGitConfig, normalizeName } from "../src/utils.js";

describe("normalizeName", () => {
  it("converts to lowercase", () => {
    expect(normalizeName("MySkill")).toBe("myskill");
  });

  it("trims whitespace", () => {
    expect(normalizeName("  my-skill  ")).toBe("my-skill");
  });

  it("replaces spaces with hyphens", () => {
    expect(normalizeName("my skill name")).toBe("my-skill-name");
  });

  it("removes special characters", () => {
    expect(normalizeName("my@skill!name")).toBe("myskillname");
  });

  it("collapses multiple hyphens", () => {
    expect(normalizeName("my--skill---name")).toBe("my-skill-name");
  });

  it("removes leading and trailing hyphens", () => {
    expect(normalizeName("-my-skill-")).toBe("my-skill");
  });

  it("handles complex input", () => {
    expect(normalizeName("  My Awesome Skill! @2024  ")).toBe(
      "my-awesome-skill-2024"
    );
  });

  it("returns empty string for invalid input", () => {
    expect(normalizeName("!!!")).toBe("");
    expect(normalizeName("@#$")).toBe("");
  });

  it("preserves numbers", () => {
    expect(normalizeName("skill123")).toBe("skill123");
    expect(normalizeName("123skill")).toBe("123skill");
  });

  it("handles unicode characters", () => {
    expect(normalizeName("café-skill")).toBe("caf-skill");
    expect(normalizeName("über-tool")).toBe("ber-tool");
  });

  it("handles empty string", () => {
    expect(normalizeName("")).toBe("");
  });

  it("handles whitespace only", () => {
    expect(normalizeName("   ")).toBe("");
  });

  it("handles multiple spaces between words", () => {
    expect(normalizeName("my    skill    name")).toBe("my-skill-name");
  });

  it("handles tabs and newlines", () => {
    expect(normalizeName("my\tskill\nname")).toBe("my-skill-name");
  });

  it("handles mixed case with numbers", () => {
    expect(normalizeName("MySkill2024Version")).toBe("myskill2024version");
  });
});

describe("getGitConfig", () => {
  it("returns git config value when available", async () => {
    // This test relies on actual git config, skip if not in a git environment
    const name = await getGitConfig("user.name");
    // Just verify it returns a string (may be empty if git not configured)
    expect(typeof name).toBe("string");
  });

  it("returns empty string for non-existent config key", async () => {
    const value = await getGitConfig("nonexistent.key.that.does.not.exist");
    expect(value).toBe("");
  });

  it("returns empty string for invalid git command", async () => {
    const value = await getGitConfig("");
    expect(value).toBe("");
  });
});
