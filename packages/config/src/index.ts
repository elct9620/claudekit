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

enum CommitLogic {
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

export type Config = {
  commit?: CommitConfig;
};

function isConfigExists(path: string): boolean {
  return fs.existsSync(path);
}

export async function loadConfig(): Promise<Config> {
  // NOTE: Know issue for plugin, the CLAUDE_PROJECT_DIR is not passed to the plugin env.
  const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();

  const searchPaths = CONFIG_SEARCH_PATHS.map((p) => `${projectRoot}/${p}`);
  const configPath = searchPaths.find(isConfigExists);

  if (!configPath) {
    return {};
  }

  try {
    const configContent = await fsAsync.readFile(configPath, "utf-8");
    const config = JSON.parse(configContent) as Config;
    return config;
  } catch (e) {
    return {};
  }
}
