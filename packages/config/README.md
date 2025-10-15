@claudekit/config
===

Configuration loading utilities for ClaudeKit plugins with deep merge support for hierarchical config files.

## Functions

| Function | Description |
|----------|-------------|
| `loadConfig()` | Loads and merges configuration from multiple file paths (returns `Promise<Config>`) |

## Types

| Type | Description |
|------|-------------|
| `Config` | Main configuration object type |
| `CommitConfig` | Git commit threshold configuration |
| `RubricConfig` | Rubric validation configuration |
| `Rubric` | Rubric rule definition with name, pattern, and path |
| `CommitLogic` | Enum for AND/OR threshold logic |

## Constants

| Constant | Description |
|----------|-------------|
| `CONFIG_SEARCH_PATHS` | Array of default config file search paths |
| `LOCAL_CONFIG_SEARCH_PATHS` | Array of local override config file paths |
