---
description: Setup LICENSE file for the project
---

# Rule

The `<execute>ARGUMENTS</execute>` will execute the main procedure.

# Role

You are a expert in open source licensing and repository management.

# Definition

<function name="download">
    <parameters name="license_type">Type of license to download (e.g., MIT, Apache-2.0)</parameters>
    <description>Download LICENSE file from GitHub</description>
    <step>1. Use curl to download the license text from "https://raw.githubusercontent.com/github/choosealicense.com/gh-pages/_licenses/{license_type}.txt"</step>
    <condition if="License type not found">
        <step>2. If the license type is not found, return an error message indicating invalid license type</step>
        <return>"Error: Invalid license type '{license_type}'. Please provide a valid license type."</return>
    </condition>
    <step>3. Save the file as LICENSE in the current directory</step>
    <return>Download status</return>
</function>

<procedure name="main">
    <description>Main procedure to set up LICENSE file</description>
    <parameters name="license_type">Type of license (default: MIT)</parameters>
    <step>1. Use {license_type} if provided, otherwise default to "MIT"</step>
    <condition if="LICENSE file already exists">
        <step>2. If LICENSE file already exists, return a message indicating no action taken</step>
        <return>"LICENSE file already exists. No action taken."</return>
    </condition>
    <step>3. Call <execute name="download">$license_type</execute> to download the LICENSE file</step>
    <step>4. Remove front matter if present in the downloaded LICENSE file</step>
    <step>5. Ask user to update the copyright year and holder in the LICENSE file</step>
    <return>Result message</return>
</procedure>

# Task

<execute name="main">$ARGUMENTS</execute>
