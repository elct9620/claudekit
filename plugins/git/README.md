Git Plugin
===

## Purpose

Common repository operations for git.

## Commands

| Command        | Description                                                       |
|----------------|-------------------------------------------------------------------|
| `/git:commit`  | Create a git commit message based on current context             |
| `/git:ignore`  | Set up `.gitignore` file by detecting language and downloading templates |

## Hooks

| Hook Event | Matcher | Description                                                      |
|------------|---------|------------------------------------------------------------------|
| Stop       | *       | Prevents commits exceeding configured file/line change thresholds |

## Configuration

| Option                         | Type    | Default | Description                                              |
|--------------------------------|---------|---------|----------------------------------------------------------|
| `commit.threshold.enabled`     | boolean | -       | Enable or disable the commit hook                        |
| `commit.threshold.maxFilesChanged` | number | 10 | Maximum number of files that can be changed              |
| `commit.threshold.maxLinesChanged` | number | 500 | Maximum number of lines that can be changed              |
| `commit.threshold.logic`       | string  | "OR"    | Threshold logic: "OR" (either) or "AND" (both)           |
| `commit.threshold.blockReason` | string  | -       | Custom block message with placeholder support: `{changedFiles}`, `{maxChangedFiles}`, `{changedLines}`, `{untrackedLines}`, `{totalChangedLines}`, `{maxChangedLines}` |
