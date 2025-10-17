import { HookEventName } from "./input.js";

export const BlockDecision = "block";
type Decision = typeof BlockDecision | undefined;

type SharedOutput = {};

export type HookSpecificOutput<T extends HookEventName> = {
  hookEventName: T;
  additionalContext?: string;
};

export type StopOutput = SharedOutput & {
  decision: Decision;
  reason?: string;
};

export type PostToolUseOutput = SharedOutput & {
  decision: Decision;
  reason?: string;
  hookSpecificOutput?: HookSpecificOutput<HookEventName.PostToolUse>;
};
