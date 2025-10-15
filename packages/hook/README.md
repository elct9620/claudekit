@claudekit/hook
===

Hook system utilities for Claude Code hooks with stdin JSON parsing and decision helpers.

## Functions

| Function | Description |
|----------|-------------|
| `loadHook<T>(source?)` | Load and parse JSON input from stdin with snake_case to camelCase conversion (returns `Promise<T>`) |
| `stop(isPass?, reason?)` | Generate Stop hook decision JSON |
| `postToolUse(isPass?, reason?, additionalContext?)` | Generate PostToolUse hook decision JSON |

## Types

| Type | Description |
|------|-------------|
| `HookInput` | Union type for all hook input types |
| `StopInput` | Stop hook input type |
| `PostToolUseInput` | PostToolUse hook input type |
| `StopOutput` | Stop hook output type |
| `PostToolUseOutput` | PostToolUse hook output type |
| `HookSpecificOutput<T>` | Generic hook-specific output with event name and additional context |

## Constants

| Constant | Description |
|----------|-------------|
| `HookEventName` | Enum for hook event names (Stop, PostToolUse) |
| `BlockDecision` | String constant value "block" for blocking decisions |
