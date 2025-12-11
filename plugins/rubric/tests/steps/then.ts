import { expect } from "vitest";
import type { Rule } from "../../src/core.js";

type HookOutput = {
  decision?: "block";
  reason?: string;
  hookSpecificOutput?: {
    hookEventName: string;
    additionalContext?: string;
  };
};

export function thenHookOutputShouldAllow(output: string): void {
  const parsed: HookOutput = JSON.parse(output);
  expect(parsed.decision).toBeUndefined();
  expect(parsed.reason).toBe("");
}

export function thenHookOutputShouldBlock(output: string, expectedReason?: string): void {
  const parsed: HookOutput = JSON.parse(output);
  expect(parsed.decision).toBe("block");
  expect(parsed.reason).toBeDefined();

  if (expectedReason) {
    expect(parsed.reason).toContain(expectedReason);
  }
}

export function thenHookOutputShouldHaveAdditionalContext(
  output: string,
  expectedContext?: string,
): void {
  const parsed: HookOutput = JSON.parse(output);
  expect(parsed.decision).toBeUndefined();
  expect(parsed.hookSpecificOutput).toBeDefined();
  expect(parsed.hookSpecificOutput?.additionalContext).toBeDefined();

  if (expectedContext) {
    expect(parsed.hookSpecificOutput?.additionalContext).toContain(expectedContext);
  }
}

export function thenHookOutputShouldIncludeReferences(output: string, ...references: string[]): void {
  const parsed: HookOutput = JSON.parse(output);
  const message = parsed.reason || parsed.hookSpecificOutput?.additionalContext || "";

  for (const ref of references) {
    expect(message).toContain(`@${ref}`);
  }
}

export function thenRulesShouldMatch(rules: Rule[], filePath: string, expectedCount: number): void {
  const matched = rules.filter((rule) => rule.pattern.test(filePath));
  expect(matched).toHaveLength(expectedCount);
}

export function thenRuleShouldHaveReference(rule: Rule, expectedReference: string): void {
  expect(rule.reference).toBe(expectedReference);
}

export function thenRuleShouldHavePath(rule: Rule, expectedPath: string): void {
  expect(rule.path).toBe(expectedPath);
}

export function thenPatternShouldMatch(pattern: RegExp, testPath: string): void {
  expect(pattern.test(testPath)).toBe(true);
}

export function thenPatternShouldNotMatch(pattern: RegExp, testPath: string): void {
  expect(pattern.test(testPath)).toBe(false);
}

export function thenRulesCountShouldBe(rules: Rule[], expectedCount: number): void {
  expect(rules).toHaveLength(expectedCount);
}

export function thenRuleShouldHaveName(rule: Rule, expectedName: string): void {
  expect(rule.name).toBe(expectedName);
}

export function thenRulePatternShouldMatch(rule: Rule, testPath: string): void {
  expect(rule.pattern.test(testPath)).toBe(true);
}

export function thenRulePatternShouldNotMatch(rule: Rule, testPath: string): void {
  expect(rule.pattern.test(testPath)).toBe(false);
}

export function thenRulePatternShouldBeRegExp(rule: Rule): void {
  expect(rule.pattern).toBeInstanceOf(RegExp);
}

export function thenAllRulePatternsShouldBeRegExp(rules: Rule[]): void {
  expect(rules.every((rule) => rule.pattern instanceof RegExp)).toBe(true);
}

export function thenMatchedRulesCountShouldBe(rules: Rule[], filePath: string, expectedCount: number): void {
  const matched = rules.filter((rule) => rule.pattern.test(filePath));
  expect(matched).toHaveLength(expectedCount);
}
