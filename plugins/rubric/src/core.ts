export type Rule = {
  name: string;
  pattern: RegExp;
  path: string;
  reference: string;
};

export function createRule(
  name: string,
  pattern: RegExp,
  path: string,
): Rule {
  return {
    name,
    pattern,
    path,
    reference: `@${path}`,
  };
}

export function matchRules(rules: Rule[], filePath: string): Rule[] {
  return rules.filter((rule) => rule.pattern.test(filePath));
}
