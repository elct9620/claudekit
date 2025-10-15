# Rubric Plugin

Self-review system for code changes in Claude Code.

## Overview

The Rubric plugin automatically triggers code reviews after Edit or Write operations through Claude Code's hook system.

## Hook Behavior

This plugin registers a `PostToolUse` hook that matches `Edit|Write` tool operations. After any file modification, the hook is triggered to perform automated review.

## Configuration

Configuration options will be defined in `claudekit.json` or `claudekit.local.json`.

## Development

Build the plugin:

```bash
pnpm build
```

This compiles TypeScript and bundles the hook executable to `dist/review.js`.
