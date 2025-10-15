@claudekit/hook
===

Hook system utilities for Claude Code hooks with stdin JSON parsing and decision helpers.

**Exported Functions:**

- `loadHook<T>(source?): Promise<T>` - Load and parse JSON input from stdin with snake_case to camelCase conversion
- `stop(isPass?, reason?): string` - Generate Stop hook decision JSON
- `postToolUse(isPass?, reason?, additionalContext?): string` - Generate PostToolUse hook decision JSON

**Exported Types:**

- `HookInput` - Union type for all hook input types
- `StopInput` - Stop hook input type
- `PostToolUseInput` - PostToolUse hook input type
- `StopOutput` - Stop hook output type
- `PostToolUseOutput` - PostToolUse hook output type

**Exported Constants:**

- `HookEventName` - Enum for hook event names (Stop, PostToolUse)
- `BlockDecision` - Constant for blocking decision value
