import type { Config } from "@claudekit/config";
import { createRule, type Rule } from "./core.js";

/**
 * Load rules from rubric config
 */
export function loadRubricRules(config: Config): Rule[] {
  const rubricRules = config.rubric?.rules ?? [];

  return rubricRules.map((rule) =>
    createRule(
      rule.name || "Unnamed Rule",
      new RegExp(rule.pattern),
      rule.path,
    ),
  );
}
