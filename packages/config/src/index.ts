import fsAsync from "fs/promises";
import fs from "fs";

/**
 * Paths to search for configuration files, in order of precedence.
 *
 * NOTE: claudekit is common name for the config file, we may expand to other names in the future.
 */
export const CONFIG_SEARCH_PATHS = [
  "claudekit.config.json",
  "claudekit.json",
  ".claude/claudekit.config.json",
  ".claude/claudekit.json",
];

export const LOCAL_CONFIG_SEARCH_PATHS = [
  "claudekit.local.json",
  ".claude/claudekit.local.json",
];

export enum CommitLogic {
  AND = "AND",
  OR = "OR",
}

/**
 * Configuration for enforceing Claude Code to not commit large changes.
 */
export type CommitConfig = {
  threshold: {
    enabled: boolean;
    maxFilesChanged?: number;
    maxLinesChanged?: number;
    logic?: CommitLogic;
    blockReason?: string;
  };
};

export type Rubric = {
  name?: string;
  pattern: string;
  path: string;
};

export type RubricConfig = {
  enforce?: boolean;
  rules: Rubric[];
  reviewMessage?: string;
};

export type Config = {
  commit?: CommitConfig;
  rubric?: RubricConfig;
};

function isConfigExists(path: string): boolean {
  return fs.existsSync(path);
}

function deepMerge(target: any, source: any): any {
  if (Array.isArray(target) && Array.isArray(source)) {
    return source; // Replace arrays entirely
  } else if (
    target !== null &&
    typeof target === "object" &&
    source !== null &&
    typeof source === "object"
  ) {
    const merged: any = { ...target };
    for (const key of Object.keys(source)) {
      if (key in target) {
        merged[key] = deepMerge(target[key], source[key]);
      } else {
        merged[key] = source[key];
      }
    }
    return merged;
  }
  return source; // For primitive types, just use the source value
}

export async function loadConfig(): Promise<Config> {
  // NOTE: Know issue for plugin, the CLAUDE_PROJECT_DIR is not passed to the plugin env.
  const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();

  const searchPaths = CONFIG_SEARCH_PATHS.map((p) => `${projectRoot}/${p}`);
  const configPath = searchPaths.find(isConfigExists);

  const localSearchPaths = LOCAL_CONFIG_SEARCH_PATHS.map(
    (p) => `${projectRoot}/${p}`,
  );
  const localConfigPath = localSearchPaths.find(isConfigExists);

  const projectConfig: Config = {};
  if (configPath) {
    try {
      const fileContent = await fsAsync.readFile(configPath, "utf-8");
      Object.assign(projectConfig, JSON.parse(fileContent));
    } catch (error) {
      throw new Error(`Failed to parse config file at ${configPath}: ${error}`);
    }
  }

  const localConfig: Config = {};
  if (localConfigPath) {
    try {
      const fileContent = await fsAsync.readFile(localConfigPath, "utf-8");
      Object.assign(localConfig, JSON.parse(fileContent));
    } catch (error) {
      throw new Error(
        `Failed to parse local config file at ${localConfigPath}: ${error}`,
      );
    }
  }

  return deepMerge(projectConfig, localConfig);
}
