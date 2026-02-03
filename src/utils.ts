import { execa } from "execa";

export function normalizeName(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function getGitConfig(key: string): Promise<string> {
  try {
    const { stdout } = await execa("git", ["config", "--get", key]);
    return stdout.trim();
  } catch {
    return "";
  }
}
