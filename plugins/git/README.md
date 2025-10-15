Git Plugin
===

## Purpose

Common repository operations for git.

## Commands

| Command        | Description                                                       |
|----------------|-------------------------------------------------------------------|
| `/git:ignore`  | Set up `.gitignore` file by detecting language and downloading templates |

## Hooks

| Hook Event | Matcher | Description                                                      |
|------------|---------|------------------------------------------------------------------|
| Stop       | *       | Prevents commits exceeding configured file/line change thresholds |

## Configuration

Configure the commit threshold hook in `claudekit.json` or `claudekit.local.json`.

**Configuration Options:**

| Option                 | Type    | Required | Default | Description                                              |
|------------------------|---------|----------|---------|----------------------------------------------------------|
| `commit.threshold.enabled` | boolean | Yes      | -       | Enable or disable the commit hook                        |
| `commit.threshold.maxFilesChanged` | number  | No       | 10      | Maximum number of files that can be changed              |
| `commit.threshold.maxLinesChanged` | number  | No       | 500     | Maximum number of lines that can be changed              |
| `commit.threshold.logic` | string  | No       | "OR"    | Threshold logic: "OR" (either) or "AND" (both)           |
| `commit.threshold.blockReason` | string  | No       | See below | Custom block message with placeholder support            |

**Placeholder Variables:**

| Placeholder            | Description                                    |
|------------------------|------------------------------------------------|
| `{changedFiles}`       | Current number of changed files                |
| `{maxChangedFiles}`    | Maximum allowed changed files                  |
| `{changedLines}`       | Number of changed lines in tracked files       |
| `{untrackedLines}`     | Number of lines in untracked files             |
| `{totalChangedLines}`  | Total changed lines (tracked + untracked)      |
| `{maxChangedLines}`    | Maximum allowed changed lines                  |

**Examples:**

Basic configuration:
```json
{
  "commit": {
    "threshold": {
      "enabled": true,
      "maxFilesChanged": 10,
      "maxLinesChanged": 500,
      "logic": "OR"
    }
  }
}
```

Strict mode with custom message:
```json
{
  "commit": {
    "threshold": {
      "enabled": true,
      "maxFilesChanged": 5,
      "maxLinesChanged": 100,
      "logic": "AND",
      "blockReason": "Too many changes: {totalChangedLines} lines in {changedFiles} files."
    }
  }
}
```
