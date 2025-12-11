import type { Rule } from "../../src/core.js";
import { matchRules } from "../../src/core.js";
import { loadRubricRules } from "../../src/rubric.js";

export function whenMatchingFileAgainstConfig(config: any, filePath: string): Rule[] {
  const rules = loadRubricRules(config);
  return matchRules(rules, filePath);
}

export function whenBuildingReviewMessage(matchedRules: Rule[], template: string): string {
  const references = matchedRules.map((rule) => rule.reference);
  return template.replace("{references}", references.join(", "));
}
