import { describe, expect, it } from "vitest";
import { getQuietInput } from "../src/prompts.js";

describe("getQuietInput", () => {
  it("returns normalized input when all fields are valid", () => {
    const result = getQuietInput("My Brand", "My Skill", "A test description");

    expect(result).toEqual({
      brandName: "my-brand",
      skillName: "my-skill",
      skillDescription: "A test description",
    });
  });

  it("uses name as brand when brand is not provided", () => {
    const result = getQuietInput(undefined, "my-skill", "A description");

    expect(result.brandName).toBe("my-skill");
    expect(result.skillName).toBe("my-skill");
  });

  it("throws when name is not provided", () => {
    expect(() => getQuietInput(undefined, undefined, "A description")).toThrow(
      "--name is required in quiet mode"
    );
  });

  it("throws when description is not provided", () => {
    expect(() => getQuietInput(undefined, "my-skill", undefined)).toThrow(
      "--description is required in quiet mode"
    );
  });

  it("throws when name has no valid characters", () => {
    expect(() => getQuietInput(undefined, "!!!", "A description")).toThrow(
      "Name must contain at least one letter or number"
    );
  });

  it("throws when brand has no valid characters", () => {
    expect(() => getQuietInput("@#$", "my-skill", "A description")).toThrow(
      "Brand name must contain at least one letter or number"
    );
  });

  it("throws when description exceeds 1024 characters", () => {
    const longDescription = "a".repeat(1025);
    expect(() => getQuietInput(undefined, "my-skill", longDescription)).toThrow(
      "Description must be under 1024 characters"
    );
  });

  it("accepts description at exactly 1024 characters", () => {
    const maxDescription = "a".repeat(1024);
    const result = getQuietInput(undefined, "my-skill", maxDescription);

    expect(result.skillDescription).toBe(maxDescription);
  });

  it("normalizes brand with spaces", () => {
    const result = getQuietInput("My Brand Name", "my-skill", "A description");

    expect(result.brandName).toBe("my-brand-name");
  });

  it("normalizes skill name with uppercase", () => {
    const result = getQuietInput(undefined, "MySkill", "A description");

    expect(result.skillName).toBe("myskill");
  });

  it("preserves description exactly as provided", () => {
    const description = "A description with UPPERCASE and special chars!";
    const result = getQuietInput(undefined, "my-skill", description);

    expect(result.skillDescription).toBe(description);
  });

  it("throws when name is empty string", () => {
    expect(() => getQuietInput(undefined, "", "A description")).toThrow(
      "--name is required in quiet mode"
    );
  });

  it("throws when name is whitespace only", () => {
    expect(() => getQuietInput(undefined, "   ", "A description")).toThrow(
      "Name is required"
    );
  });

  it("throws when description is empty string", () => {
    expect(() => getQuietInput(undefined, "my-skill", "")).toThrow(
      "--description is required in quiet mode"
    );
  });

  it("accepts brand with numbers", () => {
    const result = getQuietInput("brand123", "my-skill", "A description");

    expect(result.brandName).toBe("brand123");
  });

  it("handles brand and name being different", () => {
    const result = getQuietInput(
      "acme-corp",
      "data-processor",
      "Processes data"
    );

    expect(result.brandName).toBe("acme-corp");
    expect(result.skillName).toBe("data-processor");
  });
});
