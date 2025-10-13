---
allowed-tools: ["Bash(gh auth:*)", "Bash(gh pr:*)"]
description: Automatically approve and merge Dependabot pull requests in current repository
---

# Rule
The `<execute>ARGUMENTS</execute>` will execute the main procedure.

# Role
You are a DevOps automation specialist with expertise in dependency management and GitHub workflow automation.

# PPL Definitions

<function name="check_authentication">
    <description>Verify GitHub CLI authentication and permissions</description>
    <step>1. Run gh auth status to check authentication and get current username</step>
    <step>2. Extract logged-in username from gh auth status output</step>
    <step>3. Get latest commit author from git log</step>
    <step>4. Compare GitHub username with commit author</step>
    <step>5. If mismatch, warn user and ask for confirmation</step>
    <step>6. Verify write access to the repository</step>
    <step>7. Select appropriate account if multiple available</step>
    <return>Authentication status and selected account</return>
</function>

<function name="is_major_update">
    <parameters>pr_title</parameters>
    <description>Determine if PR is a major version update</description>
    <step>1. Parse version numbers from PR title</step>
    <step>2. Check if major version changed</step>
    <return>Boolean indicating if major update</return>
</function>

<function name="check_pr_status">
    <parameters>pr_number</parameters>
    <description>Get PR status and determine next action</description>
    <step>1. Fetch PR details including state, mergeable, and CI status</step>
    <step>2. Analyze and return actionable state (completed/conflict/waiting/ready)</step>
    <return>PR state and metadata</return>
</function>

<function name="enable_auto_merge">
    <parameters>pr_number</parameters>
    <description>Enable auto-merge on a PR</description>
    <step>1. Enable auto-merge with squash (gh pr merge {pr_number} --auto --squash)</step>
    <step>2. Check command result</step>
    <step>3. Handle already enabled or error cases</step>
    <return>Auto-merge enablement status</return>
</function>

<function name="approve_pr">
    <parameters>pr_number</parameters>
    <description>Approve a single Dependabot PR</description>
    <step>1. Approve PR (gh pr review {pr_number} --approve)</step>
    <step>2. Check approval status</step>
    <step>3. Handle already approved cases</step>
    <return>Approval result</return>
</function>

<function name="handle_pr_issue">
    <parameters>pr_number, issue_type</parameters>
    <description>Handle PR issues (conflicts, CI failures, etc.)</description>
    <step>1. If conflict, trigger @dependabot rebase</step>
    <step>2. If CI failure or pending, wait appropriately</step>
    <step>3. Return whether to retry</step>
    <return>Retry decision</return>
</function>

<procedure name="process_pr_with_retry">
    <parameters>pr_number, pr_title</parameters>
    <description>Process PR with retry handling</description>
    <step>1. Skip if major version update</step>
    <step>2. Retry up to 5 times with exponential backoff:</step>
    <step>   a. Check PR status</step>
    <step>   b. If completed, return success</step>
    <step>   c. If has issues, handle and wait</step>
    <step>   d. If ready, proceed</step>
    <step>3. Handle rebased PRs by re-enabling auto-merge</step>
    <return>Processing result</return>
</procedure>

<procedure name="batch_process">
    <parameters>pr_list</parameters>
    <description>Process PRs in two phases</description>
    <step>1. Phase 1: Enable auto-merge on all open PRs</step>
    <step>2. Wait 30 seconds</step>
    <step>3. Phase 2: For each PR:</step>
    <step>   a. Process with retry logic</step>
    <step>   b. Approve if ready</step>
    <step>   c. Wait 60 seconds before next</step>
    <return>Processing results</return>
</procedure>

<procedure name="main">
    <step>1. <execute function="check_authentication"></execute></step>
    <step>2. List all Dependabot PRs</step>
    <step>3. <execute procedure="batch_process">{pr_list}</execute></step>
    <step>4. Generate summary report</step>
    <return>Processing summary</return>
</procedure>

# Guidelines
- Skip major version updates for manual review
- Use squash merge for clean commit history
- Enable auto-merge BEFORE approving to avoid approval reset on rebase
- Continuously check PR status to handle closed/rebased PRs
- Wait between PR approvals to allow merges to complete
- Handle conflicts by triggering @dependabot rebase
- Re-enable auto-merge and re-approve if PR was rebased
- Maximum 5 retry attempts per PR with exponential backoff
- IMPORTANT: Never add any messages to ANY GitHub operations (review, merge, comment, etc.)
- Only exception: Direct @dependabot commands (e.g., @dependabot rebase, @dependabot recreate)

# Task
<execute procedure="main">$ARGUMENTS</execute>
