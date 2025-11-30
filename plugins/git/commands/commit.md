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

- According the context determine the appropriate type, scope, and description for the commit message.
- Ensure the scope is relevant to the changes made. e.g. monorepo subdirectory, specific feature, bug fix area.

# Commit Message

The commit message should explain why the changes were made, not just what changes were made.

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
