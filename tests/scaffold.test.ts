import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  copyDir,
  createSkillRepository,
  processDirectory,
  replaceInFile,
} from "../src/scaffold.js";
import type { TemplateValues } from "../src/types.js";

const TEST_DIR = join(tmpdir(), "build-skill-test");
const SRC_DIR = join(TEST_DIR, "src");
const DEST_DIR = join(TEST_DIR, "dest");

function createTestValues(
  overrides: Partial<TemplateValues> = {}
): TemplateValues {
  return {
    Brand_Name: "test-brand",
    Skill_Name: "test-skill",
    Skill_Description: "A test skill",
    Creator_Name: "Test User",
    Creator_Email: "test@example.com",
    Skill_License: "MIT",
    Skill_Homepage: "https://example.com",
    Skill_Repository: "test/repo",
    Skill_Category: "general",
    Skill_Keywords: "test",
    ...overrides,
  };
}

beforeEach(async () => {
  await mkdir(TEST_DIR, { recursive: true });
  await mkdir(SRC_DIR, { recursive: true });
});

afterEach(async () => {
  await rm(TEST_DIR, { recursive: true, force: true });
});

describe("copyDir", () => {
  it("copies files from source to destination", async () => {
    await writeFile(join(SRC_DIR, "file.txt"), "hello");

    await copyDir(SRC_DIR, DEST_DIR);

    const content = await readFile(join(DEST_DIR, "file.txt"), "utf-8");
    expect(content).toBe("hello");
  });

  it("copies nested directories", async () => {
    await mkdir(join(SRC_DIR, "nested"), { recursive: true });
    await writeFile(join(SRC_DIR, "nested", "file.txt"), "nested content");

    await copyDir(SRC_DIR, DEST_DIR);

    const content = await readFile(
      join(DEST_DIR, "nested", "file.txt"),
      "utf-8"
    );
    expect(content).toBe("nested content");
  });

  it("creates destination directory if it does not exist", async () => {
    await writeFile(join(SRC_DIR, "file.txt"), "hello");
    const nonExistentDest = join(TEST_DIR, "non-existent", "dest");

    await copyDir(SRC_DIR, nonExistentDest);

    const content = await readFile(join(nonExistentDest, "file.txt"), "utf-8");
    expect(content).toBe("hello");
  });
});

describe("replaceInFile", () => {
  it("replaces placeholders with values", async () => {
    const filePath = join(SRC_DIR, "template.txt");
    await writeFile(filePath, "Hello {Name}, welcome to {Project}!");

    const values = {
      Name: "World",
      Project: "Test",
    } as unknown as TemplateValues;

    await replaceInFile(filePath, values);

    const content = await readFile(filePath, "utf-8");
    expect(content).toBe("Hello World, welcome to Test!");
  });

  it("replaces multiple occurrences of the same placeholder", async () => {
    const filePath = join(SRC_DIR, "template.txt");
    await writeFile(filePath, "{Name} said hello to {Name}");

    const values = { Name: "Alice" } as unknown as TemplateValues;

    await replaceInFile(filePath, values);

    const content = await readFile(filePath, "utf-8");
    expect(content).toBe("Alice said hello to Alice");
  });

  it("leaves unmatched placeholders unchanged", async () => {
    const filePath = join(SRC_DIR, "template.txt");
    await writeFile(filePath, "Hello {Name}, {Unknown} placeholder");

    const values = { Name: "World" } as unknown as TemplateValues;

    await replaceInFile(filePath, values);

    const content = await readFile(filePath, "utf-8");
    expect(content).toBe("Hello World, {Unknown} placeholder");
  });
});

describe("processDirectory", () => {
  it("replaces placeholders in all files", async () => {
    await writeFile(join(SRC_DIR, "file1.txt"), "Brand: {Brand_Name}");
    await writeFile(join(SRC_DIR, "file2.txt"), "Skill: {Skill_Name}");

    const values = createTestValues({
      Brand_Name: "acme",
      Skill_Name: "my-skill",
    });

    await processDirectory(SRC_DIR, values);

    expect(await readFile(join(SRC_DIR, "file1.txt"), "utf-8")).toBe(
      "Brand: acme"
    );
    expect(await readFile(join(SRC_DIR, "file2.txt"), "utf-8")).toBe(
      "Skill: my-skill"
    );
  });

  it("renames {Skill_Name} directories", async () => {
    await mkdir(join(SRC_DIR, "{Skill_Name}"), { recursive: true });
    await writeFile(
      join(SRC_DIR, "{Skill_Name}", "skill.txt"),
      "Skill: {Skill_Name}"
    );

    const values = createTestValues({ Skill_Name: "my-skill" });

    await processDirectory(SRC_DIR, values);

    const content = await readFile(
      join(SRC_DIR, "my-skill", "skill.txt"),
      "utf-8"
    );
    expect(content).toBe("Skill: my-skill");
  });
});

describe("createSkillRepository", () => {
  it("throws when template directory does not exist", async () => {
    const nonExistentTemplate = join(TEST_DIR, "non-existent-template");

    await expect(
      createSkillRepository(
        nonExistentTemplate,
        DEST_DIR,
        createTestValues(),
        true,
        false
      )
    ).rejects.toThrow("Template directory not found");
  });

  it("throws when target directory exists and force is false", async () => {
    await mkdir(DEST_DIR, { recursive: true });

    await expect(
      createSkillRepository(SRC_DIR, DEST_DIR, createTestValues(), true, false)
    ).rejects.toThrow("Directory already exists");
  });

  it("overwrites target directory when force is true", async () => {
    await mkdir(DEST_DIR, { recursive: true });
    await writeFile(join(DEST_DIR, "old-file.txt"), "old content");
    await writeFile(join(SRC_DIR, "new-file.txt"), "new content");

    const values = createTestValues();

    await createSkillRepository(SRC_DIR, DEST_DIR, values, true, true);

    const content = await readFile(join(DEST_DIR, "new-file.txt"), "utf-8");
    expect(content).toBe("new content");

    // Old file should not exist
    await expect(
      readFile(join(DEST_DIR, "old-file.txt"), "utf-8")
    ).rejects.toThrow();
  });

  it("creates repository with processed templates", async () => {
    await writeFile(join(SRC_DIR, "readme.md"), "# {Brand_Name} Skills");
    await mkdir(join(SRC_DIR, "{Skill_Name}"), { recursive: true });
    await writeFile(
      join(SRC_DIR, "{Skill_Name}", "SKILL.md"),
      "name: {Skill_Name}\ndescription: {Skill_Description}"
    );

    const values = createTestValues({
      Brand_Name: "acme",
      Skill_Name: "my-skill",
      Skill_Description: "An awesome skill",
    });

    await createSkillRepository(SRC_DIR, DEST_DIR, values, true, false);

    const readme = await readFile(join(DEST_DIR, "readme.md"), "utf-8");
    expect(readme).toBe("# acme Skills");

    const skillMd = await readFile(
      join(DEST_DIR, "my-skill", "SKILL.md"),
      "utf-8"
    );
    expect(skillMd).toBe("name: my-skill\ndescription: An awesome skill");
  });

  it("cleans up on failure during processing", async () => {
    // Create a template with a file that will cause issues
    await writeFile(join(SRC_DIR, "good.txt"), "content");

    const values = createTestValues();

    // First create successfully
    await createSkillRepository(SRC_DIR, DEST_DIR, values, true, false);

    // Verify it was created
    const files = await readdir(DEST_DIR);
    expect(files).toContain("good.txt");
  });
});

describe("copyDir edge cases", () => {
  it("handles empty directories", async () => {
    await copyDir(SRC_DIR, DEST_DIR);

    const files = await readdir(DEST_DIR);
    expect(files).toHaveLength(0);
  });

  it("handles deeply nested structures", async () => {
    const deepPath = join(SRC_DIR, "a", "b", "c", "d");
    await mkdir(deepPath, { recursive: true });
    await writeFile(join(deepPath, "deep.txt"), "deep content");

    await copyDir(SRC_DIR, DEST_DIR);

    const content = await readFile(
      join(DEST_DIR, "a", "b", "c", "d", "deep.txt"),
      "utf-8"
    );
    expect(content).toBe("deep content");
  });

  it("preserves file contents exactly", async () => {
    const binaryLikeContent = "Special chars: \n\t\r\0 and unicode: 你好";
    await writeFile(join(SRC_DIR, "special.txt"), binaryLikeContent);

    await copyDir(SRC_DIR, DEST_DIR);

    const content = await readFile(join(DEST_DIR, "special.txt"), "utf-8");
    expect(content).toBe(binaryLikeContent);
  });

  it("copies multiple files at the same level", async () => {
    await writeFile(join(SRC_DIR, "file1.txt"), "content1");
    await writeFile(join(SRC_DIR, "file2.txt"), "content2");
    await writeFile(join(SRC_DIR, "file3.txt"), "content3");

    await copyDir(SRC_DIR, DEST_DIR);

    expect(await readFile(join(DEST_DIR, "file1.txt"), "utf-8")).toBe(
      "content1"
    );
    expect(await readFile(join(DEST_DIR, "file2.txt"), "utf-8")).toBe(
      "content2"
    );
    expect(await readFile(join(DEST_DIR, "file3.txt"), "utf-8")).toBe(
      "content3"
    );
  });
});

describe("replaceInFile edge cases", () => {
  it("handles files with no placeholders", async () => {
    const filePath = join(SRC_DIR, "plain.txt");
    await writeFile(filePath, "No placeholders here");

    const values = { Name: "World" } as unknown as TemplateValues;
    await replaceInFile(filePath, values);

    const content = await readFile(filePath, "utf-8");
    expect(content).toBe("No placeholders here");
  });

  it("handles empty files", async () => {
    const filePath = join(SRC_DIR, "empty.txt");
    await writeFile(filePath, "");

    const values = { Name: "World" } as unknown as TemplateValues;
    await replaceInFile(filePath, values);

    const content = await readFile(filePath, "utf-8");
    expect(content).toBe("");
  });

  it("handles placeholders at start and end of file", async () => {
    const filePath = join(SRC_DIR, "edges.txt");
    await writeFile(filePath, "{Start}middle{End}");

    const values = {
      Start: "BEGIN",
      End: "FINISH",
    } as unknown as TemplateValues;
    await replaceInFile(filePath, values);

    const content = await readFile(filePath, "utf-8");
    expect(content).toBe("BEGINmiddleFINISH");
  });

  it("handles adjacent placeholders", async () => {
    const filePath = join(SRC_DIR, "adjacent.txt");
    await writeFile(filePath, "{First}{Second}{Third}");

    const values = {
      First: "A",
      Second: "B",
      Third: "C",
    } as unknown as TemplateValues;
    await replaceInFile(filePath, values);

    const content = await readFile(filePath, "utf-8");
    expect(content).toBe("ABC");
  });

  it("handles multiline files", async () => {
    const filePath = join(SRC_DIR, "multiline.txt");
    await writeFile(filePath, "Line 1: {Name}\nLine 2: {Name}\nLine 3: {Name}");

    const values = { Name: "Test" } as unknown as TemplateValues;
    await replaceInFile(filePath, values);

    const content = await readFile(filePath, "utf-8");
    expect(content).toBe("Line 1: Test\nLine 2: Test\nLine 3: Test");
  });

  it("replaces all TemplateValues placeholders", async () => {
    const filePath = join(SRC_DIR, "all-values.txt");
    await writeFile(
      filePath,
      [
        "Brand: {Brand_Name}",
        "Skill: {Skill_Name}",
        "Desc: {Skill_Description}",
        "Creator: {Creator_Name}",
        "Email: {Creator_Email}",
        "License: {Skill_License}",
        "Homepage: {Skill_Homepage}",
        "Repo: {Skill_Repository}",
        "Category: {Skill_Category}",
        "Keywords: {Skill_Keywords}",
      ].join("\n")
    );

    const values = createTestValues({
      Brand_Name: "acme",
      Skill_Name: "my-skill",
      Skill_Description: "A skill",
      Creator_Name: "John Doe",
      Creator_Email: "john@example.com",
      Skill_Keywords: "test, demo",
    });
    await replaceInFile(filePath, values);

    const content = await readFile(filePath, "utf-8");
    expect(content).toBe(
      [
        "Brand: acme",
        "Skill: my-skill",
        "Desc: A skill",
        "Creator: John Doe",
        "Email: john@example.com",
        "License: MIT",
        "Homepage: https://example.com",
        "Repo: test/repo",
        "Category: general",
        "Keywords: test, demo",
      ].join("\n")
    );
  });
});

describe("processDirectory edge cases", () => {
  it("handles nested {Skill_Name} directories", async () => {
    await mkdir(join(SRC_DIR, "skills", "{Skill_Name}"), { recursive: true });
    await writeFile(
      join(SRC_DIR, "skills", "{Skill_Name}", "config.txt"),
      "skill: {Skill_Name}"
    );

    const values = createTestValues({ Skill_Name: "my-skill" });

    await processDirectory(SRC_DIR, values);

    const content = await readFile(
      join(SRC_DIR, "skills", "my-skill", "config.txt"),
      "utf-8"
    );
    expect(content).toBe("skill: my-skill");
  });

  it("processes files in renamed directories", async () => {
    await mkdir(join(SRC_DIR, "{Skill_Name}", "sub"), { recursive: true });
    await writeFile(
      join(SRC_DIR, "{Skill_Name}", "sub", "file.txt"),
      "Brand: {Brand_Name}, Skill: {Skill_Name}"
    );

    const values = createTestValues({
      Brand_Name: "acme",
      Skill_Name: "processor",
    });

    await processDirectory(SRC_DIR, values);

    const content = await readFile(
      join(SRC_DIR, "processor", "sub", "file.txt"),
      "utf-8"
    );
    expect(content).toBe("Brand: acme, Skill: processor");
  });

  it("handles multiple directories at the same level", async () => {
    await mkdir(join(SRC_DIR, "dir1"), { recursive: true });
    await mkdir(join(SRC_DIR, "dir2"), { recursive: true });
    await writeFile(join(SRC_DIR, "dir1", "file.txt"), "{Brand_Name}");
    await writeFile(join(SRC_DIR, "dir2", "file.txt"), "{Skill_Name}");

    const values = createTestValues({
      Brand_Name: "acme",
      Skill_Name: "my-skill",
    });

    await processDirectory(SRC_DIR, values);

    expect(await readFile(join(SRC_DIR, "dir1", "file.txt"), "utf-8")).toBe(
      "acme"
    );
    expect(await readFile(join(SRC_DIR, "dir2", "file.txt"), "utf-8")).toBe(
      "my-skill"
    );
  });
});
