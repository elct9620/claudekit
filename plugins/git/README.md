Git Plugin
===

Common repository operations for git.

## Commands

### `/git:ignore`

Set up a `.gitignore` file for this project by detecting the primary language and downloading appropriate templates from GitHub's gitignore repository.

**Features:**
- Automatically detects project language based on files (e.g., package.json for Node, Gemfile for Ruby)
- Downloads official `.gitignore` templates from GitHub
- Supports manual language specification
- Uses GitHub's maintained gitignore templates

**Usage:**
```
/git:ignore
```

Or specify a language explicitly:
```
/git:ignore [language]
```

**Examples:**
```
/git:ignore
/git:ignore Node
/git:ignore Python
/git:ignore Ruby
```

**How it works:**
1. Detects primary language if not specified
2. Confirms with user if no language detected
3. Downloads `.gitignore` template from [github/gitignore](https://github.com/github/gitignore)
4. Saves to current directory

## Features

### Commit Threshold Hook

The git plugin includes a commit hook that prevents Claude Code from creating commits when there are too many changes in the working directory. This helps ensure commits remain focused and reviewable.

**How it works:**
- Monitors the number of changed files and changed lines before allowing commits
- Can be configured to use AND/OR logic for threshold enforcement
- Automatically checks both tracked changes and untracked files
- Provides customizable block messages

**Configuration:**

Create a `claudekit.json` (or `claudekit.local.json` for local-only settings) in your project root:

```json
{
  "commit": {
    "threshold": {
      "enabled": true,
      "maxFilesChanged": 10,
      "maxLinesChanged": 500,
      "logic": "OR",
      "blockReason": "There are too many changes {changedFiles}/{maxChangedFiles} changed files and {totalChangedLines}/{maxChangedLines} changed lines in the working directory. Please review and commit your changes before proceeding."
    }
  }
}
```

**Configuration Options:**

- `enabled` (boolean, required): Enable or disable the commit hook
- `maxFilesChanged` (number, optional, default: 10): Maximum number of files that can be changed
- `maxLinesChanged` (number, optional, default: 500): Maximum number of lines that can be changed (includes both tracked and untracked changes)
- `logic` (string, optional, default: "OR"): Threshold logic
  - `"OR"`: Block if EITHER files OR lines threshold is exceeded
  - `"AND"`: Block only if BOTH files AND lines thresholds are exceeded
- `blockReason` (string, optional): Custom message when commit is blocked. Supports placeholders:
  - `{changedFiles}`: Current number of changed files
  - `{maxChangedFiles}`: Maximum allowed changed files
  - `{changedLines}`: Number of changed lines in tracked files
  - `{untrackedLines}`: Number of lines in untracked files
  - `{totalChangedLines}`: Total changed lines (tracked + untracked)
  - `{maxChangedLines}`: Maximum allowed changed lines

**Examples:**

Strict mode (both thresholds must be exceeded):
```json
{
  "commit": {
    "threshold": {
      "enabled": true,
      "maxFilesChanged": 5,
      "maxLinesChanged": 100,
      "logic": "AND"
    }
  }
}
```

Permissive mode with custom message:
```json
{
  "commit": {
    "threshold": {
      "enabled": true,
      "maxFilesChanged": 20,
      "maxLinesChanged": 1000,
      "logic": "OR",
      "blockReason": "Too many changes: {totalChangedLines} lines across {changedFiles} files. Consider splitting into smaller commits."
    }
  }
}
```

**Note:** The hook can be temporarily bypassed when the stop hook is active in Claude Code.
