# Readme Rubric

This document outlines the criteria for evaluating the quality of README. We assert the all criteria must be passed.

## Criteria

Following are the criteria used to evaluate the README content.

### Main README (1 points)

For root README files, it should play as index and general usage guide for the project without unnecessary details.

```md
Claude Kit
===

## Installation

> Explain how to setup this marketplace and enable the plugins.

## Plugins

> A markdown table listing all included plugins with brief descriptions and links to their documentation.

## Configuration

> Explain how to use configuration files, link to plugin documentation for details.

```

- Keep concise and clear.
- Use links to detailed documentation for each plugin, configuration, etc.
- Only minimal necessary information should be included.

### Plugin README (1 points)

For plugin-specific README files, they should provide detailed information about the plugin.

```md
Plugin Name
===

## Purpose

> A brief description of what the plugin to do.

## Commands

> A markdown table listing all commands provided by the plugin with brief descriptions.

## Agents

> A markdown table listing all agents provided by the plugin with brief descriptions.

## Hooks

> A markdown table listing all hooks provided by the plugin with brief descriptions.

## Configuration

> Explain schema and options, use markdown tables for clarity.

```

- Easy to understand the purpose and functionality of the plugin.
- Help users quickly find commands, agents, hooks, and configuration options.
- Use markdown tables for better readability.

### Package README (1 points)

For package-specific README files, they should provide essential information about the package.

```md
Package Name
===

> Explain exported classes, functions, types, etc.

```

- The package's is designed to plugins and only internal usage.
- Provide clear explanations of exported entities.
- Make it easy for developers to understand and use the package.

## Note

The structure of the README files should be consistent across the project, avoid add unnecessary sections otherwise it will be marked as failed.
