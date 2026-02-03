export interface CliOptions {
  brand?: string;
  name?: string;
  description?: string;
  license?: string;
  website?: string;
  repository?: string;
  category?: string;
  keywords?: string;
  output?: string;
  quiet?: boolean;
  force?: boolean;
}

export interface TemplateValues {
  Brand_Name: string;
  Skill_Name: string;
  Skill_Description: string;
  Creator_Name: string;
  Creator_Email: string;
  Skill_License: string;
  Skill_Homepage: string;
  Skill_Repository: string;
  Skill_Category: string;
  Skill_Keywords: string;
}

export interface SkillInput {
  brandName: string;
  skillName: string;
  skillDescription: string;
}
