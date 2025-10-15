@claudekit/config
===

Configuration loading utilities for ClaudeKit plugins with deep merge support for hierarchical config files.

**Exported Functions:**

- `loadConfig(): Promise<Config>` - Loads and merges configuration from multiple file paths

**Exported Types:**

- `Config` - Main configuration object type
- `CommitConfig` - Git commit threshold configuration
- `RubricConfig` - Rubric validation configuration
- `CommitLogic` - Enum for AND/OR threshold logic

**Exported Constants:**

- `CONFIG_SEARCH_PATHS` - Default config file search paths
- `LOCAL_CONFIG_SEARCH_PATHS` - Local override config file paths
