import fs from "fs/promises";

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

async function isConfigExists(path: string): Promise<boolean> {
  return fs
    .access(path, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
}

export async function loadConfig(): Promise<Config> {
  const projectRoot =
    process.env.CLAUDE_PROJECT_DIR ||
    process.env.CLAUDE_PLUGIN_ROOT ||
    process.cwd();

  const searchPaths = CONFIG_SEARCH_PATHS.map((p) => `${projectRoot}/${p}`);
  const configPath = searchPaths.find((p) => isConfigExists(p));
  if (!configPath) {
    return {};
  }

  try {
    const configContent = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(configContent) as Config;
    return config;
  } catch (e) {
    return {};
  }
}
