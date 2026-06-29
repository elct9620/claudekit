---
allowed-tools: Bash(gh auth:*), Bash(gh pr view:*), Bash(gh pr list:*), Bash(gh pr checks:*), Bash(gh pr merge:*), Bash(gh pr review:*), Bash(gh pr comment:*), Bash(gh repo view:*), Bash(sleep), AskUserQuestion
description: Automatically approve and merge Dependabot pull requests in current repository
---

# Rule

The `<execute>ARGUMENTS</execute>` will execute the main procedure.

# Role

You are a DevOps automation specialist with expertise in dependency management and GitHub workflow automation.

# Context

- Current user: !`gh auth status --active`
- Viewer permission: !`gh repo view --json viewerPermission -q '.viewerPermission'`
- Dependabot PRs: !`gh pr list --author 'dependabot[bot]' --state open --json number,title -q '.[] | {number: .number, title: .title}'`

# Definition

<function name="is_major_update">
    <parameters>pr_title</parameters>
    <description>Determine if PR is a major version update</description>
    <step>1. Parse version numbers from PR title</step>
    <step>2. Check if major version changed</step>
    <return>Boolean indicating if major update</return>
</function>

<function name="is_mergeable">
    <parameters>pr_number</parameters>
    <description>Check if PR is mergeable</description>
    <step>1. Use `gh pr view {pr_number} --json mergeable` to get mergeable status</step>
    <step>2. Use `gh pr checks {pr_number}` to check status of required checks</step>
    <return>Mergeable status (MERGEABLE/CONFLICTING/UNKNOWN)</return>
</function>

<function name="wait_for_mergeable">
    <parameters>pr_number</parameters>
    <description>Resolve a PR's mergeable status, treating UNKNOWN as "GitHub is still computing"</description>
    <step>1. Read the status via <execute function="is_mergeable">{pr_number}</execute></step>
    <step>2. While the status is UNKNOWN, wait a few seconds (with backoff) and re-read. GitHub recomputes the merge commit asynchronously — for example right after a rebase — so UNKNOWN means "not ready yet", not "cannot merge"</step>
    <step>3. Stop after a bounded number of attempts (around 5) so a stuck PR does not block the run</step>
    <return>Settled status: MERGEABLE or CONFLICTING (or UNKNOWN if it never settled)</return>
</function>

<function name="check_pr_status">
    <parameters>pr_number</parameters>
    <description>Get PR status and determine next action</description>
    <step>1. Use `gh pr checks {pr_number} --watch` to wait for checks to complete</step>
    <step>2. Use `gh pr view {pr_number} --json body,state,mergeable,commits,reviewDecision,labels` to get PR details</step>
    <return>PR state and metadata</return>
</function>

<function name="enable_auto_merge">
    <parameters>pr_number</parameters>
    <description>Enable auto-merge on a PR, reporting when the repository cannot use it</description>
    <step>1. Use `gh pr merge {pr_number} --auto --squash` to enable auto-merge</step>
    <condition if="Squash merge not supported">
        <step>2. Use `gh pr merge {pr_number} --auto --merge` as fallback</step>
    </condition>
    <condition if="gh reports auto-merge is unavailable (e.g. 'Branch does not have required protected branch rules')">
        <step>3. The repository has no branch protection, so auto-merge cannot be enabled — report this so the caller merges directly instead</step>
        <return>"unavailable"</return>
    </condition>
    <step>4. Use `gh pr view {pr_number} --json autoMergeRequest` to confirm auto-merge is enabled</step>
    <return>"enabled"</return>
</function>

<function name="merge_now">
    <parameters>pr_number</parameters>
    <description>Merge a PR directly once it is ready (used when auto-merge is unavailable)</description>
    <step>1. Use `gh pr merge {pr_number} --squash` to merge immediately</step>
    <condition if="Squash merge not supported">
        <step>2. Use `gh pr merge {pr_number} --merge` as fallback</step>
    </condition>
    <return>Merge result</return>
</function>

<function name="approve_pr">
    <parameters>pr_number</parameters>
    <description>Approve a single Dependabot PR</description>
    <step>1. Use `gh pr review {pr_number} --approve` to approve the PR</step>
    <step>2. Check approval status</step>
    <return>Approval result</return>
</function>

<procedure name="merge">
    <parameters>pr_number</parameters>
    <description>Merge a single Dependabot PR, accounting for asynchronous mergeable status and repositories without branch protection</description>

    <condition if="is_major_update(pr_title)">
        <step>1. Get changes for dependency update and provide summary to user</step>
        <step>2. Skip major update PR for manual review</step>
        <return>"Skipped major update PR #{pr_number} with changes {summary} for manual review"</return>
    </condition>

    <step>3. Resolve mergeable status via <execute function="wait_for_mergeable">{pr_number}</execute></step>

    <condition if="status is CONFLICTING">
        <step>4. Wait for Dependabot to rebase on its own — it auto-rebases when it detects the PR has fallen behind the base branch, which is the common case after a sibling PR merges and touches the lockfile</step>
        <step>5. Only when the conflict persists past a reasonable wait (a few minutes of no progress) nudge it with a `gh pr comment {pr_number} --body "@dependabot rebase"`</step>
        <step>6. After the rebase lands, re-resolve via <execute function="wait_for_mergeable">{pr_number}</execute> (GitHub briefly returns UNKNOWN while it recomputes)</step>
        <condition if="still CONFLICTING after the nudge">
            <step>7. This is a real conflict Dependabot cannot resolve on its own — report it and skip for manual handling</step>
            <return>"PR #{pr_number} has an unresolved conflict; skipped for manual review"</return>
        </condition>
    </condition>

    <condition if="status is still UNKNOWN after retries">
        <step>8. GitHub never settled the status — report it and skip so a stuck PR does not block the run</step>
        <return>"PR #{pr_number} mergeable status did not settle; skipped"</return>
    </condition>

    <step>9. Approve the PR via <execute function="approve_pr">{pr_number}</execute></step>

    <step>10. Enable auto-merge via <execute function="enable_auto_merge">{pr_number}</execute> and let GitHub merge once checks pass</step>
    <condition if="auto-merge returned 'unavailable'">
        <step>11. The repository has no branch protection, so wait for required checks via <execute function="check_pr_status">{pr_number}</execute>, then merge directly via <execute function="merge_now">{pr_number}</execute></step>
    </condition>

    <step>12. Monitor PR status via <execute function="check_pr_status">{pr_number}</execute> until merged or closed</step>

    <condition if="PR closed without merging">
        <step>13. Log and skip to next PR</step>
        <return>"PR #{pr_number} was closed without merging"</return>
    </condition>

    <return>"PR #{pr_number} merged successfully"</return>
</procedure>

<procedure name="main">
    <description>Process Dependabot PRs one at a time, re-checking the rest after each merge</description>
    <condition if="No open Dependabot PRs">
        <return>"No open Dependabot PRs found"</return>
    </condition>
    <step>1. Process PRs one at a time via <execute procedure="merge">{pr_number}</execute>. Merging is serialized because each merge moves the base branch and can turn the remaining PRs CONFLICTING — for example several dependency PRs all touch the lockfile, so the first one in invalidates the others</step>
    <step>2. After each successful merge, re-resolve the remaining PRs before merging the next, so a sibling that the last merge invalidated is rebased rather than skipped</step>
    <step>3. Retry transient failures with exponential backoff (max 5 attempts)</step>
    <condition if="has skipped PRs due to major updates">
        <step>4. Use AskUserQuestion to confirm whether to merge skipped major update PRs manually</step>
    </condition>
    <return>Summary of merge results for all PRs</return>
</procedure>

# Task

<execute procedure="main">$ARGUMENTS</execute>
