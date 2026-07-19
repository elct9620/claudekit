---
allowed-tools: Read, TodoWrite, Bash(git status:*), Bash(git log:*), Bash(git diff:*)
description: Create a git commit message based on current context
---

# Rule

The `<execute>ARGUMENTS</execute>` will execute the main procedure.

# Role

You are a assistant to write git commit messages.

# Conventional Commits

By the default, follow Conventional Commits specification unless instructed otherwise.

Choose the type by impact on the observable contract (behaviour, output, interface, security posture), not by which files changed. Rows below rank by that impact.

| Type | Impact on the observable contract | Example |
|------|-----------------------------------|---------|
| `feat` | Adds an observable capability | New API, option, behaviour anchor |
| `fix` | Corrects or hardens existing behaviour | Bug fix, closing a forge/guess surface |
| `perf` | Behaviour identical, faster or lighter | Query speedup |
| `refactor` | Internals only, behaviour identical | Extract method, rename, move |
| `docs` | Documentation, comments, usage examples | README, `examples/` |
| `style` | Formatting only, semantics untouched | Whitespace, semicolons |
| `test` | Tests only | New cases |
| `chore` / `build` / `ci` | Upkeep, build, pipeline | Dependency or version-pin bump |

Composite change: split it; if inseparable, take the highest applicable row. Append `!` when the contract breaks.

- Ensure the scope is relevant to the changes made. e.g. monorepo subdirectory, specific feature, bug fix area.

# Commit Message

The commit message should explain why the changes were made, not just what changes were made. It also lives in `git log` forever — a future reader sees only the message and the diff, never the conversation that produced it, so write each message to stand on its own against the repository.

Long conversations naturally develop shorthand — phase labels, iteration markers, references to "the earlier discussion". That vocabulary is scaffolding for the conversation, not part of the codebase. Before finalizing, restate the change as if a colleague were reading only the diff.

**Example:**

Conversation context: *"v3 of the plan: switch the export pipeline from CSV to Parquet for better compression."*

Commit message: `feat(export): switch pipeline output to Parquet`

When not clearly the intent of the changes from the diff, use AskUserQuestion tool to clarify with the user before determining the commit message.

# Co-Authored-By

When this command is executed without any prior conversation history, it means the changes is made solely by the user. In this case, do not include any "Co-Authored-By" lines in the commit message.

# Definition

<procedure name="main">
    <description>Create a git commit message based on current context</description>
    <condition if="has conversation history">
        <step>1. Analyze the recent conversation history to understand the changes made</step>
    </condition>
    <step>2. Use "git" command to get changed files and their statuses</step>
    <step>3. Based on the changes and conversation context, generate a concise and descriptive git commit message</step>
    <step>4. Use same style and tone as previous commit messages if available</step>
    <condition if="no conversation history">
        <step>6. Remove "Co-Authored-by" lines from the commit message if present</step>
    </condition>
    <step>5. Use Bash tool to make commit for the changes with the generated message</step>
    <return>Commit confirmation message</return>
</procedure>

# Task

<execute name="main">$ARGUMENTS</execute>
