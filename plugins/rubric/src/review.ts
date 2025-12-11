#!/usr/bin/env node

import { loadConfig } from "@claudekit/config";
import { loadHook, postToolUse, type PostToolUseInput } from "@claudekit/hook";
import { matchRules } from "./core.js";
import { discoverRules } from "./rules.js";
import { loadRubricRules } from "./rubric.js";

const SUPPORTED_TOOL_NAMES = ["Edit", "Write"];
const DEFAULT_REVIEW_MESSAGE =
  "Ensure review changes against {references} and resolve violations until reached criteria requirements defined in the rubric.";

const hook = await loadHook<PostToolUseInput>();

if (!SUPPORTED_TOOL_NAMES.includes(hook.toolName)) {
  process.exit(0);
}

const config = await loadConfig();
const filePath = hook.toolInput.filePath;

// Load rules from both sources
const rubricRules = loadRubricRules(config);
const discoveredRules = discoverRules();
const allRules = [...rubricRules, ...discoveredRules];

// Match rules against file path
const matchedRules = matchRules(allRules, filePath);
if (matchedRules.length === 0) {
  console.log(postToolUse(true));
  process.exit(0);
}

// Build review message
const references = matchedRules.map((rule) => rule.reference);
const messageTemplate = config.rubric?.reviewMessage || DEFAULT_REVIEW_MESSAGE;
const reviewMessage = messageTemplate.replace(
  "{references}",
  references.join(", "),
);

// Output decision
const isEnforced = config.rubric?.enforce ?? true;
if (isEnforced) {
  console.log(postToolUse(false, reviewMessage));
} else {
  console.log(postToolUse(true, "The changes match rubric rules.", reviewMessage));
}
