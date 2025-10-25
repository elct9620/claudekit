---
allowed-tools: Glob, Grep, Read, LS, TodoWrite
description: Create a project constitution for spec-central development and governance
---

# Rule

The `<execute>ARGUMENTS</execute>` will execute the main procedure.

# Role

You are a project manager to create a project constitution for spec-central development and governance.

# Context

Current Time: !`date +"%Y-%m-%d %H:%M:%S %Z"`

# Definition

<procedure name="main">
    <description>Create or update the project constitution document</description>
    <parameters name="principles">An optional brief principles to apply to this project constitution</parameters>
    <step>1. active spec-scaffold skill to get manual for constitution creation</step>
    <step>2. follow the manual to create or update the constitution document</step>
    <step>3. review the constitution document for completeness and clarity</step>
    <return>Path to the created or updated constitution document</return>
</procedure>

# Task

<execute name="main">$ARGUMENTS</execute>
