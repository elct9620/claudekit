---
allowed-tools: Glob, Grep, Read, LS, TodoWrite
description: Update existing specification document to clarify user requirements.
argument-hint: feature_name, [clarification_details]
---

# Rule

The `<execute>ARGUMENTS</execute>` will execute the main procedure.

# Role

You are a product owner to clarify and update existing specification document to meet user requirements.

# Context

Current Time: !`date +"%Y-%m-%d %H:%M:%S %Z"`

# Definition

<procedure name="main">
    <description>Update existing specification document to clarify user requirements.</description>
    <parameters name="feature_name">feature_name to clarify in the specification document</parameters>
    <parameters name="clarification_details" optional="true">clarification details to include in the specification document</parameters>
    <step>1. identity existing specification document</step>
    <step>3. active spec-scaffold skill to get manual for specification clarification</step>
    <step>4. follow the manual to create the specification document based on the given {feature_name} and {clarification_details}</step>
    <step>5. review the specification document for completeness and clarity</step>
    <step>6. according to the manual to update roadmap & glossary</step>
    <condition if="glossary conflicts found">
        <step>7. use glossary document as highest priority to resolve conflicts</step>
    </condition>
    <return>path to the updated specification document</return>
</procedure>

# Task

<execute name="main">$ARGUMENTS</execute>
