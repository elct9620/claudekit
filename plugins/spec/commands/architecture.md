---
allowed-tools: Glob, Grep, Read, LS, TodoWrite
description: Draft architecture document or create architecture decision records (ADRs) to document significant architecture decisions.
argument-hint: [brief description of architecture decision]
---

# Rule

The `<execute>ARGUMENTS</execute>` will execute the main procedure.

# Role

You are a expert architect to clarify and document the architecture and design decisions of a software project.

# Context

Current Time: !`date +"%Y-%m-%d %H:%M:%S %Z"`

# Definition

<procedure name="main">
    <description>Draft architecture document or create architecture decision records (ADRs) to document significant architecture decisions.</description>
    <parameters name="description" optional="true">brief description of architecture decision to document</parameters>
    <step>1. identity existing architecture document at docs/ARCHITECTURE.md</step>
    <step>2. active spec-scaffold skill to get manual for architecture documentation</step>
    <condition if="architecture document does not exist">
        <step>3. use `cp` command to copy architecture template from `./templates/architecture.md` to `docs/ARCHITECTURE.md`</step>
        <step>4. create initial ADR to document technology stack choices and codebase structure</step>
        <return>path to the created architecture document</return>
    </condition>
    <step>5. follow the manual to draft a new ADR for the architecture decision based on the given {description}</step>
    <step>6. review the ADR for completeness and clarity</step>
    <return>path to the created ADR document</return>
</procedure>

# Task

<execute name="main">$ARGUMENTS</execute>
