# Rubric Plugin

Automated code standards checks based on custom rubrics.

## Overview

The Rubric plugin hooks into Edit or Write operations through Claude Code's hook system.

## Hook Behavior

This plugin registers a `PostToolUse` hook that matches `Edit|Write` tool operations.

## Configuration

Configuration options will be defined in `claudekit.json` or `claudekit.local.json`.

## Development

Build the plugin:

```bash
pnpm build
```

This compiles TypeScript and bundles the hook executable to `dist/review.js`.
