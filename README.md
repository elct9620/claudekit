Claude Kit
===

A collection of plugins for Claude Code used by Aotokitsuruya.

## Installation

In `claude` run:

```
/plugin marketplace install elct9620/claudekit
```

## Plugins

| Plugin     | Description                                  | Documentation                            |
|------------|----------------------------------------------|------------------------------------------|
| Dependabot | Manage Dependabot PRs in GitHub repositories | [README](./plugins/dependabot/README.md) |
| Git        | Common repository operations for git         | [README](./plugins/git/README.md)        |
| License    | Manage open source licenses                  | [README](./plugins/license/README.md)    |

## Configuration

ClaudeKit plugins can be configured using a `claudekit.json` file in your project root. You can also create a `claudekit.local.json` file for local-only settings that won't be committed to version control (add it to `.gitignore`).

### Configuration File Locations

ClaudeKit searches for configuration files in the following order (later files override earlier ones):

1. `claudekit.config.json` (project-wide configuration)
2. `claudekit.json` (project-wide configuration)
3. `.claude/claudekit.config.json` (project-wide configuration in .claude directory)
4. `.claude/claudekit.json` (project-wide configuration in .claude directory)
5. `claudekit.local.json` (local overrides, recommended to gitignore)
6. `.claude/claudekit.local.json` (local overrides in .claude directory)

### Configuration Schema

Currently supported configuration options:

#### Commit Threshold (Git Plugin)

Controls when Claude Code is allowed to create commits based on the amount of changes:

```json
{
  "commit": {
    "threshold": {
      "enabled": true,
      "maxFilesChanged": 10,
      "maxLinesChanged": 500,
      "logic": "OR",
      "blockReason": "Custom message with {placeholders}"
    }
  }
}
```

**Options:**
- `enabled` (boolean, required): Enable/disable the commit hook
- `maxFilesChanged` (number, optional, default: 10): Max number of changed files
- `maxLinesChanged` (number, optional, default: 500): Max number of changed lines (tracked + untracked)
- `logic` (string, optional, default: "OR"): Threshold enforcement logic
  - `"OR"`: Block if either threshold is exceeded
  - `"AND"`: Block only if both thresholds are exceeded
- `blockReason` (string, optional): Custom block message with placeholder support

See the [Git Plugin README](./plugins/git/README.md#commit-threshold-hook) for detailed documentation and examples.

### Example Configuration

```json
{
  "commit": {
    "threshold": {
      "enabled": true,
      "maxFilesChanged": 5,
      "maxLinesChanged": 100,
      "logic": "OR",
      "blockReason": "Too many changes: {totalChangedLines} lines in {changedFiles} files"
    }
  }
}
```

### Local Configuration

For settings you don't want to commit (e.g., personal preferences), create `claudekit.local.json`:

```json
{
  "commit": {
    "threshold": {
      "maxFilesChanged": 20,
      "maxLinesChanged": 1000
    }
  }
}
```

This will merge with your project configuration, with local settings taking precedence.
