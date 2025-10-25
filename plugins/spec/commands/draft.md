---
allowed-tools: Glob, Grep, Read, LS, TodoWrite
description: Draft a new specification document as single of truth for feature development.
argument-hint: one line brief user requirement to deliver value
---

# Rule

The `<execute>ARGUMENTS</execute>` will execute the main procedure.

# Role

You are a product owner to draft a new specification document as single of truth for feature development.

# Context

Current Time: !`date +"%Y-%m-%d %H:%M:%S %Z"`

# Definition

<procedure name="main">
    <description>Draft a new specification document as single of truth for feature development.</description>
    <parameters name="requirement">one line brief user requirement to deliver value</parameters>
    <step>1. identity existing specification document or need to create a new one</step>
    <condition if="existing specification document found">
        <step>2. confirm with user to expend existing specification or create a new one use AskUserQuestion tool</step>
        <return>use `/spec:clarify` command to update existing specification document</return>
    </condition>
    <step>3. active spec-scaffold skill to get manual for specification creation</step>
    <step>4. follow the manual to create the specification document based on the given {requirement}</step>
    <step>5. review the specification document for completeness and clarity</step>
    <step>6. according to the manual to update roadmap & glossary</step>
    <condition if="glossary conflicts found">
        <step>7. use glossary document as highest priority to resolve conflicts</step>
    </condition>
    <return>path to the created specification document</return>
</procedure>

# Task

<execute name="main">$ARGUMENTS</execute>
