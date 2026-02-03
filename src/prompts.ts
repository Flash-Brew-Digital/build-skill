import { cancel, group, log, outro, text } from "@clack/prompts";
import pc from "picocolors";
import type { SkillInput } from "./types.js";
import { normalizeName } from "./utils.js";

const MAX_DESCRIPTION_LENGTH = 1024;

function validateName(value: string | undefined): string | undefined {
  if (!value?.trim()) {
    return "Name is required";
  }
  if (!normalizeName(value)) {
    return "Name must contain at least one letter or number";
  }
}

function validateDescription(value: string | undefined): string | undefined {
  if (!value) {
    return "Description is required";
  }
  if (value.length > MAX_DESCRIPTION_LENGTH) {
    return `Description must be under ${MAX_DESCRIPTION_LENGTH} characters`;
  }
}

export async function promptForInput(
  providedBrand?: string,
  providedName?: string,
  providedDescription?: string
): Promise<SkillInput> {
  const answers = await group(
    {
      brandName: () => {
        if (providedBrand) {
          return Promise.resolve(providedBrand);
        }
        return text({
          message: "What is your brand/organization name?",
          placeholder: "acme-corp",
          validate: validateName,
        });
      },
      skillName: () => {
        if (providedName) {
          return Promise.resolve(providedName);
        }
        return text({
          message: "What is the name of your first skill?",
          placeholder: "my-skill",
          validate: validateName,
        });
      },
      skillDescription: () => {
        if (providedDescription) {
          return Promise.resolve(providedDescription);
        }
        return text({
          message: "Describe what this skill does and when to use it:",
          placeholder:
            "Helps with X tasks. Use when working with Y or when the user mentions Z.",
          validate: validateDescription,
        });
      },
    },
    {
      onCancel: () => {
        cancel("Operation cancelled.");
        process.exit(0);
      },
    }
  );

  return {
    brandName: normalizeName(answers.brandName as string),
    skillName: normalizeName(answers.skillName as string),
    skillDescription: answers.skillDescription as string,
  };
}

export function getQuietInput(
  providedBrand?: string,
  providedName?: string,
  providedDescription?: string
): SkillInput {
  // Validate required fields
  if (!providedName) {
    throw new Error("--name is required in quiet mode");
  }
  if (!providedDescription) {
    throw new Error("--description is required in quiet mode");
  }

  // Use brand if provided, otherwise default to name
  const brand = providedBrand || providedName;

  // Validate name format
  const nameError = validateName(providedName);
  if (nameError) {
    throw new Error(nameError);
  }

  const brandError = validateName(brand);
  if (brandError) {
    throw new Error(`Brand ${brandError.toLowerCase()}`);
  }

  // Validate description
  const descError = validateDescription(providedDescription);
  if (descError) {
    throw new Error(descError);
  }

  return {
    brandName: normalizeName(brand),
    skillName: normalizeName(providedName),
    skillDescription: providedDescription,
  };
}

export function printSuccess(
  targetDir: string,
  brandName: string,
  skillName: string,
  quiet: boolean
): void {
  if (quiet) {
    console.log(targetDir);
    return;
  }

  log.success(`Created ${pc.cyan(targetDir)}`);
  log.info(`
Next steps:
  ${pc.cyan(`cd ${brandName}-skills`)}
  ${pc.cyan("git init")}
  ${pc.cyan("git remote add origin <YOUR_REPO_URL>")}
  ${pc.cyan("git branch -M main")}
  ${pc.cyan("git add .")}
  ${pc.cyan(`git commit -m "Initial release of ${skillName} skill"`)}
  ${pc.cyan("git push -u origin main")}

Edit your skill at:
  ${pc.cyan(`skills/${skillName}/SKILL.md`)}
`);

  outro(pc.green("Happy building! 🚀"));
}
