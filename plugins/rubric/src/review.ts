#!/usr/bin/env node

import { loadConfig } from "@claudekit/config";
import { loadHook, postToolUse, type PostToolUseInput } from "@claudekit/hook";

const SUPPORTED_TOOL_NAMES = ["Edit", "Write", "MultiWrite"];
const DEFAULT_REVIEW_MESSAGE =
  "Ensure review changes against {references}, fix rubrics violations and keep the code clean before proceeding.";

const hook = await loadHook<PostToolUseInput>();

const isSupportedTool = SUPPORTED_TOOL_NAMES.includes(hook.toolName);
if (!isSupportedTool) {
  // Not a supported tool, exit early.
  process.exit(0);
}

const config = await loadConfig();
const isRubricDefined = Boolean(config.rubric);
if (!isRubricDefined) {
  // No rubric defined, exit early.
  process.exit(0);
}

const filePath = hook.toolInput.filePath;
const messageTemplate = config.rubric?.reviewMessage || DEFAULT_REVIEW_MESSAGE;
const rules = (config.rubric?.rules ?? []).map((rule) => ({
  name: rule.name || "Unnamed Rule",
  pattern: new RegExp(rule.pattern),
  path: rule.path,
  reference: `@${rule.path}`,
}));

const matches = rules.filter((rule) => rule.pattern.test(filePath));
const references = matches.map((rule) => rule.reference);
if (matches.length === 0) {
  console.log(postToolUse(true));
  process.exit(0);
}

const isEnforced = config.rubric?.enforce ?? true;
const reviewMessage = messageTemplate.replace(
  "{references}",
  references.join(", "),
);

if (isEnforced) {
  console.log(postToolUse(false, reviewMessage));
  process.exit(0);
}

console.log(
  postToolUse(true, "The changes match rubric rules.", reviewMessage),
);
