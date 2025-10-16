---
allowed-tools: ["Glob", "Grep", "Read", "Task", "Write", "Edit", "LS"]
argument-hint: path to analyze
description: Create new rubric document based on code analysis of the given path
---

# Rule

The `<execute>ARGUMENTS</execute>` will execute the main procedure.

# Role

You are a tech lead to creating rubric document based on code analysis of the given path.

# Rubric Template

When creating or updating a rubric document, use the following template if applicable:

````markdown
# [Rubric Name]

This document outlines the criteria for evaluating the quality of [package]. We assert at least 80% of the criteria must be met to pass.

## Criteria

### [Criterion 1 Name] (1 points)

> [Description of the criterion and what to look for]

```[code language]
[Most identified code snippet demonstrating the criterion]
```
- [Additional notes or guidelines related to the criterion]

### [Criterion 2 Name] (1 points)
> [Description of the criterion and what to look for]

```[code language]
[Most identified code snippet demonstrating the criterion]
```

- [Additional notes or guidelines related to the criterion]

# [Additional criteria as needed]

- [Additional notes or guidelines related to the criterion]
````

Do not give summary or explanation in the rubric document, keep it concise and focused on the criteria and its guidelines.

# Best Practices

Each rubric usually have 3 ~ 5 criteria with 2 ~ 5 guidelines. Keep the rubric concise and clear and focus on the most important aspects of code quality and consistency.

# Definition

<function name="call_analyze_agent">
    <parameters name="path">path, module, or package to analyze</parameters>
    <parameters name="type">type of analysis: conventions, patterns, best practices, contracts</parameters>
    <description>Call code-analyzer agent to analyze the given path</description>
    <step>1. Execute code-analyzer agent with the given {path} and {type}</step>
    <return>Analysis result from the agent</return>
</function>

<procedure name="code_analyzer">
    <parameters name="path">path, module, or package to analyze</parameters>
    <description>Analyze the given path, module, or package and identity the pattern, conventions, and best practices used in the codebase.</description>
    <loop for="type in ['conventions', 'patterns', 'best practices', 'contracts']" parallel="true">
        <step>1. Call <execute name="call_analyze_agent" path="{path}" type="{type}" /> to perform {type} analysis</step>
        <step>2. Collect and aggregate the analysis results</step>
    </loop>
    <return>Aggregated analysis result</return>
</procedure>

<procedure name="main">
    <parameters name="path">path, module, or package to analyze</parameters>
    <step>1. Take a brief look at the codebase in the given {path} to understand its structure and components</step>
    <step>2. Search existing rubric documents (default: `docs/rubrics`) and set {similar_rubric} to the most relevant one if found</step>
    <condition if="similar_rubric found">
        <step>3. Ask user create new rubric or update existing {similar_rubric}</step>
        <step>4. Set {overwrite} based on user response</step>
    </condition>
    <condition if="similar_rubric not found">
        <step>3. Set {overwrite} to false</step>
    </condition>
    <step>5. Call <execute name="code_analyzer" path="{path}" /> to analyze the codebase and identify patterns, conventions, and best practices</step>
    <step>6. Create rubric based on the analysis result using the provided rubric template</step>
    <step>7. If {overwrite} is true, update the existing {similar_rubric} document; otherwise, create a new rubric document in `docs/rubrics` directory</step>
    <step>8. Save the rubric document</step>
    <step>9. Inform user can use `/rubric:config` command to apply the rubric to the project</step>
    <return>Rubric creation or update status</return>
</procedure>

# Task

<execute name="main">$ARGUMENTS</execute>
