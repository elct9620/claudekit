Claude Kit
===

A collection of plugins for Claude Code used by Aotokitsuruya.

## Installation

In `claude` run:

```
/plugin marketplace install elct9620/claudekit
```

## Plugins

### Dependabot

Use the `gh` command to manage Dependabot PRs in GitHub repositories.

Commands:
- `/dependabot:merge` - Automatically approve and merge Dependabot pull requests in current repository

### Git

Common repository operations for git.

Commands:
- `/git:ignore` - Set up a .gitignore file for this project by detecting the primary language and downloading appropriate templates from GitHub's gitignore repository

### License

Commands to manage open source licenses in current repository.

Commands:
- `/license:setup` - Setup LICENSE file for the project (defaults to MIT license)
