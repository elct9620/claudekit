Dependabot Plugin
===

Use the `gh` command to manage Dependabot PRs in GitHub repositories.

## Commands

### `/dependabot:merge`

Automatically approve and merge Dependabot pull requests in current repository.

**Features:**
- Automatically approves and merges Dependabot PRs
- Skips major version updates for manual review
- Handles merge conflicts by requesting rebases
- Processes multiple PRs in parallel with retry logic
- Enables auto-merge with squash commits (falls back to merge commits if needed)

**Requirements:**
- GitHub CLI (`gh`) must be installed and authenticated
- Repository write permissions required
- Auto-merge must be enabled in repository settings

**Usage:**
```
/dependabot:merge
```

This command will:
1. Check authentication and permissions
2. List all open Dependabot PRs
3. Enable auto-merge on each PR
4. Approve each PR automatically
5. Monitor PR status until merged or closed
6. Handle conflicts by requesting rebases from Dependabot
