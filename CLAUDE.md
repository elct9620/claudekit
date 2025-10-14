# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ClaudeKit is a collection of Claude Code plugins maintained by Aotokitsuruya. The repository is organized as a pnpm monorepo containing multiple plugins that extend Claude Code's capabilities.

## Repository Structure

This is a pnpm workspace monorepo with two main directories:

**`packages/`** - Shared TypeScript libraries:
- `@claudekit/config` - Configuration loading with deep merge support for `claudekit.json` and `claudekit.local.json`
- `@claudekit/hook` - Hook system utilities for Claude Code hooks (stdin JSON parsing, stop hook helpers)

**`plugins/`** - Claude Code plugins:
```
plugins/
├── dependabot/        # Dependabot PR management
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── commands/
│   │   └── merge.md
│   └── README.md
├── git/               # Git operations with hooks
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── commands/
│   │   └── ignore.md
│   ├── hooks/
│   │   └── hooks.json
│   ├── src/
│   │   ├── commit.ts   # Stop hook implementation
│   │   └── git.ts      # Git status utilities
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

**Build Process**:
- TypeScript compilation (`tsc`) generates type definitions
- Rolldown bundles source into single executable files in `dist/`
- Only plugins with build scripts (currently `git` plugin) require building
- Packages (`config`, `hook`) are consumed directly via TypeScript source (`"main": "src/index.ts"`)

**Testing Changes**: After modifying plugin code, rebuild with `pnpm build` before testing slash commands.

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

## Hook System Architecture

The git plugin implements Claude Code hooks to intercept operations before they execute:

**Hook Flow**:
1. Claude Code triggers hook event (e.g., `Stop` before commit)
2. `hooks/hooks.json` defines which executable to run (`dist/commit.js`)
3. Hook receives JSON input via stdin (parsed by `@claudekit/hook`)
4. Hook logic executes (e.g., check git status, compare against thresholds)
5. Hook outputs decision: allow (undefined) or block ("block") with reason
6. Claude Code proceeds or shows block message to user

**Git Plugin Stop Hook** (`src/commit.ts`):
- Prevents commits exceeding configured thresholds (files changed, lines changed)
- Reads `claudekit.json` config via `@claudekit/config`
- Uses `src/git.ts` utilities to count changed/untracked files and lines
- Supports AND/OR logic for combining thresholds
- Skips when `stopHookActive: true` (user override)

**Key Files**:
- `packages/hook/src/index.ts` - Hook I/O primitives, JSON parsing, decision helpers
- `packages/config/src/index.ts` - Config loading from multiple paths with deep merge
- `plugins/git/hooks/hooks.json` - Hook registration manifest
- `plugins/git/src/commit.ts` - Stop hook implementation
- `plugins/git/src/git.ts` - Git operations (status, diff, ls-files)

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

## Configuration System

ClaudeKit uses a hierarchical configuration system via `@claudekit/config`:

**Search Order** (later overrides earlier):
1. `claudekit.config.json` / `claudekit.json` (project-wide)
2. `.claude/claudekit.config.json` / `.claude/claudekit.json` (project-wide)
3. `claudekit.local.json` / `.claude/claudekit.local.json` (gitignored local overrides)

**Deep Merge Behavior**:
- Objects are merged recursively
- Arrays are replaced entirely
- Primitives use the override value

**Current Config Options**:
- `commit.threshold.enabled` - Enable/disable commit size checks
- `commit.threshold.maxFilesChanged` - File count limit (default: 10)
- `commit.threshold.maxLinesChanged` - Line count limit (default: 500)
- `commit.threshold.logic` - "OR" (either) or "AND" (both) for thresholds
- `commit.threshold.blockReason` - Custom message with placeholders: `{changedFiles}`, `{maxChangedFiles}`, `{changedLines}`, `{untrackedLines}`, `{totalChangedLines}`, `{maxChangedLines}`

See README.md for configuration examples.

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
4. For plugins with hooks, rebuild with `pnpm build` after changes to see updated behavior

## Creating New Plugins

To add a new plugin:

1. **Create plugin directory**: `plugins/<plugin-name>/`
2. **Add plugin manifest**: `.claude-plugin/plugin.json` with metadata
3. **Create commands**: `commands/<command-name>.md` with procedural instructions
4. **Add to workspace**: Already included via `pnpm-workspace.yaml` glob pattern
5. **Optional - Add hooks**: If plugin needs to intercept Claude Code operations:
   - Create `hooks/hooks.json` to register hook events
   - Add TypeScript source in `src/` for hook logic
   - Add build configuration (`package.json` scripts, `rolldown.config.js`, `tsconfig.json`)
   - Use `@claudekit/hook` for stdin parsing and decision helpers
   - Use `@claudekit/config` for configuration loading
6. **Build if needed**: `pnpm build` to bundle hook executables

**Example Hook Plugin Structure** (see `plugins/git/`):
```
plugins/your-plugin/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   └── yourcommand.md
├── hooks/
│   └── hooks.json        # Register hook events
├── src/
│   └── your-hook.ts      # Hook implementation
├── dist/
│   └── your-hook.js      # Built executable (tracked in git)
├── package.json          # Include build script
├── rolldown.config.js    # Bundle configuration
└── tsconfig.json         # TypeScript config
```

## Plugin Command Tool Restrictions

Commands specify `allowed-tools` in front matter to restrict which tools can be used during execution. For example, the dependabot merge command only allows:
- `Bash(gh auth:*)` - GitHub CLI authentication
- `Bash(gh pr:*)` - GitHub CLI PR operations
- `Bash(gh repo view:*)` - GitHub CLI repository view
- `Bash(sleep)` - Sleep for retry/wait logic

This ensures commands operate within their intended scope.
