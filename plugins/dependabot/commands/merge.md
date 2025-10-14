---
allowed-tools: ["Bash(gh auth:*)", "Bash(gh pr:*)", "Bash(gh repo view:*)", "Bash(sleep)"]
description: Automatically approve and merge Dependabot pull requests in current repository
---

# Rule

The `<execute>ARGUMENTS</execute>` will execute the main procedure.

# Role

You are a DevOps automation specialist with expertise in dependency management and GitHub workflow automation.

# Definition

<function name="check_permissions">
    <description>Get repository permissions for the authenticated user</description>
    <step>1. Run `gh auth status --active` to get authentication status</step>
    <step>2. Run `gh repo view --json viewerPermission` to get permission level</step>
    <return>Permission level (admin/write/read/none)</return>
</function>

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

<function name="check_pr_status">
    <parameters>pr_number</parameters>
    <description>Get PR status and determine next action</description>
    <step>1. Use `gh pr checks {pr_number} --watch` to wait for checks to complete</step>
    <step>2. Use `gh pr view {pr_number} --json state,mergeable,commits,reviewDecision,labels` to get PR details</step>
    <return>PR state and metadata</return>
</function>

<function name="enable_auto_merge">
    <parameters>pr_number</parameters>
    <description>Enable auto-merge on a PR</description>
    <step>1. Use `gh pr merge {pr_number} --auto --squash` to enable auto-merge</step>
    <condition if="Squash merge not supported">
        <step>2. Use `gh pr merge {pr_number} --auto --merge` as fallback</step>>
    </condition>
    <step>3. Use `gh pr view {pr_number} --json autoMergeRequest` to confirm auto-merge is enabled</step>
    <return>Auto-merge enablement status</return>
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
    <description>Merge a single Dependabot PR</description>
    <condition if="is_major_update(pr_title)">
        <step>1. Skip major version updates for manual review</step>
        <return>"Skipped major update PR #{pr_number} for manual review"</return>
    </condition>
    <condition if="is_mergeable(pr_number) != 'MERGEABLE'">
        <step>2. Log and skip non-mergeable PR</step>
        <return>"PR #{pr_number} is not mergeable"</return>
    </condition>
    <step>3. Call <execute function="enable_auto_merge">{pr_number}</execute> to enable auto-merge</step>
    <step>4. Call <execute function="approve_pr">{pr_number}</execute> to approve the PR</step>
    <step>5. Monitor PR status using <execute function="check_pr_status">{pr_number}</execute> until merged or closed</step>
    <condition if="PR closed without merging">
        <step>6. Log and skip to next PR</step>
        <return>"PR #{pr_number} was closed without merging"</return>
    </condition>
    <condition if="PR has conflects">
        <step>7. Wait 30 seconds and recheck status</step>
        <step>8. If still conflicts, comment "@dependabot rebase" to trigger rebase</step>
        <step>9. Monitor PR status again</step>
        <step>10. Re-enable auto-merge and re-approve if needed</step>
        <step>11. Monitor until merged or closed</step>
    </condition>
    <return>"PR #{pr_number} merged successfully"</return>
</procedure>

<procedure name="merge_in_parallel">
    <parameters>pr_list</parameters>
    <description>Process multiple PRs in parallel with retry logic</description>
    <step>1. For each PR in {pr_list}, spawn a separate process to call <execute procedure="merge">{pr_number}</execute></step>
    <step>2. Implement retry logic with exponential backoff for transient failures (max 5 attempts)</step>
    <return>List of merge results for each PR</return>
</procedure>

<procedure name="main">
    <step>1. <execute function="check_authentication"></execute></step>
    <step>2. Use `gh pr list --author dependabot[bot] --state open --json number,title` to get list of open Dependabot PRs</step>
    <condition if="No open Dependabot PRs">
        <return>"No open Dependabot PRs found"</return>
    </condition>
    <step>3. Call <execute procedure="merge_in_parallel">{pr_list}</execute> to process PRs</step>
    <return>Summary of merge results</return>
</procedure>

# Task

<execute procedure="main">$ARGUMENTS</execute>
