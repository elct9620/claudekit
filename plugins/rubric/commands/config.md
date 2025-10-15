---
allowed-tools: ["Glob", "Grep", "Read", "Task", "Write", "Edit"]
argument-hint: "[rubric-path]"
description: Configure rubric settings for the current project
---

# Rule

The `<execute>ARGUMENTS</execute>` will execute the main procedure.

# Role

You are a assistant to help update config.

## Config Schema

The configuration file `claudekit.json` has the following structure:

```json
{
  "rubric": {
    "enforce": true, // Optional default is true
    "reviewMessage": "Make self-review with {references}", // Optional default message, the {references} will be replaced with links to the rubric documents
    "rules": [
      {
        "name": "JavaScript Files", // Optional descriptive name for the rule
        "pattern": ".*\\.js$",
        "path": "path/to/rubric/document.md"
      }
    ]
  }
}
```

## Definition

<function name="read_config">
    <description>Read existing claudekit.json configuration file</description>
    <step>1. Check if [.claude/]claudekit[.local].json file exists</step>
    <condition if="file exists">
        <step>2. Read and parse the JSON content of the file</step>
        <return>Parsed JSON object</return>
    </condition>
    <condition if="file does not exist">
        <return>Empty JSON object</return>
    </condition>
</function>

<function name="apply_rule">
    <description>Update claudekit.json with new rubric rule</description>
    <parameters name="config">Existing configuration object</parameters>
    <parameters name="name">Rubric name</parameters>
    <parameters name="pattern">File pattern to apply rubric in RegExp</parameters>
    <parameters name="path">Path to the rubric document</parameters>
    <step>1. Call <execute name="read_config" /> to get current configuration</step>
    <step>2. Update or add the rubric configuration under "rubric.rules" key with provided {name}, {pattern}, and {path}</step>
    <step>3. Write the updated configuration back to [.claude/]claudekit[.local].json file</step>
    <return>Configuration update status</return>
</function>

<function name="apply_enforce">
    <description>Update claudekit.json with new enforce setting</description>
    <parameters name="config">Existing configuration object</parameters>
    <parameters name="enforce">Boolean to enable or disable enforcement</parameters>
    <step>1. Call <execute name="read_config" /> to get current configuration</step>
    <step>2. Update or add the "rubric.enforce" key with provided {enforce} value</step>
    <>
    <step>3. Write the updated configuration back to [.claude/]claudekit[.local].json file</step>
    <return>Configuration update status</return>
</function>

<function name="apply_review_message">
    <description>Update claudekit.json with new review message</description>
    <parameters name="config">Existing configuration object</parameters>
    <parameters name="message">Review message template</parameters>
    <step>1. Ensure references placeholder {references} is included in the message</step>
    <step>2. Call <execute name="read_config" /> to get current configuration</step>
    <step>3. Update or add the "rubric.reviewMessage" key with provided {message}</step>
    <step>4. Write the updated configuration back to [.claude/]claudekit[.local].json file</step>
    <return>Configuration update status</return>
</function>

<procedure name="main">
    <description>Update claudekit.json to modify rubric config</description>
    <parameters name="path">Document path define the rubric</parameters>
    <condition if="path not provided">
        <step>1. Confirm with user to update rules or change config, e.g. enforce or reviewMessage</step>
        <step>2. Set {action} to user input</step>
    </condition>
    <condition if="{action} is enforce">
        <step>3. Ask user to provide enforce value (true/false)</step>
        <step>4. Set {enforce} to user input</step>
        <step>5. <execute name="apply_enforce">{config} {enforce}</execute> to update the config file</step>
        <return>Configuration update status</return>
    </condition>
    <condition if="{action} is reviewMessage">
        <step>3. Ask user to provide the review message template</step>
        <step>4. Set {message} to user input</step>
        <step>5. <execute name="apply_review_message">{config} {message}</execute> to update the config file</step>
        <return>Configuration update status</return>
    </condition>
    <condition if="{action} is rules or path provided">
        <step>3. Ask user to provide the path to the rubric document</step>
        <step>4. Set {path} to user input</step>
    </condition>
    <step>5. Review the provided {path} to understand the rubric apply to the project</step>
    <step>6. Set {name} and {pattern} based on the rubric document</step>
    <condition if="user deny the detected name or pattern">
        <step>7. Ask user to provide the correct {name} and {pattern}</step>
        <step>8. Set {name} and {pattern} to user input</step>
    </condition>
    <step>9. <execute name="apply_config">{config} {name} {pattern} {path}</execute> to update the config file</step>
    <return>Configuration update status</return>
</procedure>

## Task

<execute name="main">$ARGUMENTS</execute>
