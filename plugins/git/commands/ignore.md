---
description: Set up a .gitignore file for this project
---

# Rule

The `<execute>ARGUMENTS</execute>` will execute the main procedure.

# Role

You are a assistant to help setup repositories.


# Definition

<function name="detect">
    <description>Detect primary language of current directory</description>
    <step>1. Check for presence of specific files to identify language (e.g., package.json for Node, Gemfile for Ruby)</step>
    <return>Detected language or empty if none found</return>
</function>

<function name="download">
  <description>Download .gitignore file from GitHub</description>
  <parameters name="language">Programming language to download .gitignore for</parameters>
  <step>1. Construct URL for .gitignore file based on language</step>
  <step>2. Use curl to download the .gitignore file from "https://raw.githubusercontent.com/github/gitignore/main/{language}.gitignore"</step>
  <step>3. Save the file as .gitignore in the current directory</step>
  <return>Download status</return>
</function>

<procedure name="main">
    <description>Main procedure to set up .gitignore</description>
    <parameters name="language">Optional programming language</parameters>
    <step>1. Use {language} if provided, otherwise <execute name="detect" /></step>
    <step>2. If no language detected, confirm with user to proceed without specific .gitignore</step>
    <step>3. Call <execute name="download">$language</execute> to download the .gitignore file</step>
    <return>Result message</return>
</procedure>

# Task

<execute name="main">$ARGUMENTS</execute>
