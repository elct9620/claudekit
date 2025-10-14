# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ClaudeKit is a collection of Claude Code plugins maintained by Aotokitsuruya. The repository is organized as a pnpm monorepo containing multiple plugins that extend Claude Code's capabilities.

## Repository Structure

This is a pnpm workspace monorepo with plugins organized under `plugins/` directory. Each plugin follows the Claude Code plugin structure:

```
plugins/
├── dependabot/        # Dependabot PR management
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── commands/
│   │   └── merge.md
│   └── README.md
├── git/               # Git operations
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── commands/
│   │   └── ignore.md
│   └── README.md
└── license/           # License management
    ├── .claude-plugin/
    │   └── plugin.json
    ├── commands/
    │   └── setup.md
    └── README.md
```

**Important**: Plugin `dist/` directories are tracked in git (see .gitignore lines 86-88). This is intentional for Claude Code plugin distribution.

## Build Commands

Build all plugins:
```bash
pnpm build
```

This runs the build script in each workspace package recursively.

## Plugin Architecture

Each plugin follows a consistent structure:

1. **Plugin manifest** (`.claude-plugin/plugin.json`): Contains plugin metadata (name, description, version, author)
2. **Command definitions** (`commands/*.md`): Each command is a markdown file with:
   - Front matter with `description` and optional `allowed-tools`
   - Procedural instructions using XML-like syntax (`<function>`, `<procedure>`, `<step>`, `<condition>`, `<execute>`)
   - Task section that executes the main procedure with `$ARGUMENTS`
3. **Documentation** (`README.md`): User-facing documentation for each plugin

### Command Definition Pattern

Commands use a structured procedural approach:
- **Functions**: Reusable operations that return values
- **Procedures**: Multi-step workflows that orchestrate functions
- **Steps**: Individual actions within functions/procedures
- **Conditions**: Branching logic based on runtime state
- **Execute**: Invokes defined functions/procedures with parameters

Example pattern from dependabot plugin:
```xml
<function name="check_permissions">
    <description>Get repository permissions</description>
    <step>1. Run authentication check</step>
    <step>2. Get permission level</step>
    <return>Permission level</return>
</function>

<procedure name="main">
    <step>1. <execute function="check_permissions"></execute></step>
    <step>2. Process results</step>
</procedure>
```

## Plugin Workflows

### Dependabot Plugin (`/dependabot:merge`)
Key workflow: Parallel PR processing with retry logic
- Checks authentication and permissions
- Lists open Dependabot PRs
- Skips major version updates
- Handles merge conflicts via Dependabot rebase
- Enables auto-merge and approves PRs
- Monitors until merged or closed

### Git Plugin (`/git:ignore`)
Key workflow: Language detection and template download
- Detects language from project files (package.json, Gemfile, etc.)
- Downloads official .gitignore from github/gitignore
- Supports manual language specification

### License Plugin (`/license:setup`)
Key workflow: License template setup
- Defaults to MIT license
- Downloads from choosealicense.com
- Removes front matter from template
- Prompts for copyright year/holder update

## Development Notes

- **Package Manager**: pnpm (version 10.15.1)
- **Plugin Distribution**: Plugins are distributed via Claude Code plugin marketplace at `elct9620/claudekit`
- **Version**: 0.1.0 (all plugins currently at 0.1.0)
- **License**: MIT

## Testing Plugin Commands

To test a plugin command during development:
1. Ensure the command markdown file exists in `plugins/<plugin-name>/commands/`
2. The command will be available as `/[plugin-name]:[command-name]`
3. Test with and without arguments as specified in the command's `$ARGUMENTS` parameter

## Plugin Command Tool Restrictions

Commands specify `allowed-tools` in front matter to restrict which tools can be used during execution. For example, the dependabot merge command only allows:
- `Bash(gh auth:*)` - GitHub CLI authentication
- `Bash(gh pr:*)` - GitHub CLI PR operations
- `Bash(gh repo view:*)` - GitHub CLI repository view
- `Bash(sleep)` - Sleep for retry/wait logic

This ensures commands operate within their intended scope.
