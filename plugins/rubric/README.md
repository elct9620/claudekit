# Rubric Plugin

Automated code standards checks based on custom rubrics.

## Purpose

Automatically validates file changes against custom rubrics (coding standards, style guides, documentation requirements) when using Edit or Write operations.

## Commands

| Command | Description |
|---------|-------------|
| `/rubric:config [rubric-path]` | Configure rubric settings for the current project |
| `/rubric:create <path>` | Create new rubric document based on code analysis of the given path |

## Agents

| Agent | Description |
|-------|-------------|
| `code-analyzer` | Analyzes code patterns, conventions, best practices, and contracts for rubric generation |

## Hooks

| Hook Event   | Matcher      | Description                                                                 |
|--------------|--------------|-----------------------------------------------------------------------------|
| PostToolUse  | Edit\|Write  | Validates edited/written files against configured rubric rules              |

## Configuration

Rules can be defined via Claude Code rule files (`.claude/rules/*.md`) or `claudekit.json`. Rule files support `name` and `paths` frontmatter fields.

| Option                  | Type      | Required | Default                                       | Description                                      |
|-------------------------|-----------|----------|-----------------------------------------------|--------------------------------------------------|
| `rubric.enforce`        | boolean   | No       | `true`                                        | Block operations on rubric violations            |
| `rubric.reviewMessage`  | string    | No       | See below                                     | Custom message template with `{references}` placeholder |
| `rubric.rules`          | array     | No       | `[]`                                          | List of rubric rules to apply                    |
| `rubric.rules[].name`   | string    | No       | `"Unnamed Rule"`                              | Human-readable rule name                         |
| `rubric.rules[].pattern`| string    | Yes      | -                                             | Regex pattern to match file paths                |
| `rubric.rules[].path`   | string    | Yes      | -                                             | Path to rubric document (relative to project root) |

**Default Review Message:**
```
Ensure review changes against {references}, fix rubrics violations and keep the code clean before proceeding.
```

**Examples:**

Basic setup with enforcement:
```json
{
  "rubric": {
    "rules": [
      {
        "name": "README Guidelines",
        "pattern": "README\\.md$",
        "path": "docs/rubrics/readme.md"
      },
      {
        "name": "TypeScript Style Guide",
        "pattern": "\\.ts$",
        "path": "docs/rubrics/typescript.md"
      }
    ]
  }
}
```

Custom message with warning mode:
```json
{
  "rubric": {
    "enforce": false,
    "reviewMessage": "Please review your changes against {references} before committing.",
    "rules": [
      {
        "name": "API Documentation",
        "pattern": "src/api/.*\\.ts$",
        "path": "docs/rubrics/api-docs.md"
      }
    ]
  }
}
```

Multiple patterns:
```json
{
  "rubric": {
    "rules": [
      {
        "name": "Component Standards",
        "pattern": "components/.*\\.(tsx|jsx)$",
        "path": "docs/rubrics/components.md"
      },
      {
        "name": "Test Requirements",
        "pattern": "\\.(test|spec)\\.(ts|js)$",
        "path": "docs/rubrics/testing.md"
      }
    ]
  }
}
```

**Note:** Patterns use JavaScript regex syntax. Remember to escape special regex characters with double backslashes in JSON strings.
