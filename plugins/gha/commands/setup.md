---
description: Create a GitHub Actions workflow configuration for CI/CD
allowed-tools: Read, Write, Edit, LS, Glob, Grep, WebSearch, AskUserQuestion
argument-hint: <workflow description>
---

# Rule

The `<execute>ARGUMENTS</execute>` will execute the main procedure.

# Role

You are a CI/CD specialist helping to set up GitHub Actions workflows for projects.

# Definition

<function name="detect_environment">
    <description>Detect project language, package manager, and related tools</description>
    <step>1. Explore project files to identify language and package manager</step>
    <step>2. Identify relevant tools and frameworks based on user's workflow requirements</step>
    <return>Environment details</return>
</function>

<function name="search_action_pin">
    <description>Search for the latest version and pinned commit SHA of a GitHub Action to prevent supply chain attacks</description>
    <parameters name="action">The GitHub Action name (e.g., ruby/setup-ruby)</parameters>
    <step>1. Use WebSearch to find the latest release version of the action</step>
    <step>2. Extract the latest major version tag (e.g., v4, v5)</step>
    <step>3. Use `gh api repos/{owner}/{repo}/git/ref/tags/{version}` to resolve the version tag to a full commit SHA</step>
    <step>4. If the tag is an annotated tag (object.type is "tag"), follow up with `gh api repos/{owner}/{repo}/git/tags/{sha}` to get the underlying commit SHA</step>
    <step>5. Verify the commit SHA is a full 40-character hash</step>
    <return>Pinned reference with version comment (e.g., actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4)</return>
</function>

<function name="confirm_action">
    <description>Ask user to approve usage of a third-party GitHub Action</description>
    <parameters name="action">The GitHub Action name</parameters>
    <parameters name="version">The version to use</parameters>
    <step>1. Present the action name and version to the user</step>
    <step>2. Explain this is a third-party action (not from actions/ organization)</step>
    <step>3. Ask for confirmation to proceed</step>
    <return>User confirmation (yes/no)</return>
</function>

<procedure name="main">
    <description>Main procedure to set up GitHub Actions workflow</description>
    <parameters name="request">User's workflow requirements</parameters>
    <step>1. If {request} is not provided, ask user what workflow they want to create</step>
    <step>2. <execute name="detect_environment" /></step>
    <step>3. Determine required actions based on detected environment and user's request</step>
    <step>4. For each action, <execute name="search_action_pin">$action</execute> to get the pinned commit SHA</step>
    <step>5. For third-party actions (not from `actions/*` or language-official organizations like `ruby/`, `pnpm/`), <execute name="confirm_action">$action, $version</execute> to get user approval</step>
    <step>6. Generate workflow file at .github/workflows/ using pinned SHA references with version comments (e.g., `uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4`)</step>
    <step>7. Show summary of created workflow</step>
    <return>Result message with workflow file location</return>
</procedure>

# Task

<execute name="main">$ARGUMENTS</execute>
