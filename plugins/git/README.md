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
