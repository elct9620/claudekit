import { describe, it } from "vitest";
import { createRule, matchRules } from "../src/core.js";
import { SAMPLE_RULES } from "./steps/fixtures.js";
import {
  thenRulesShouldMatch,
  thenRuleShouldHaveReference,
  thenRuleShouldHaveName,
  thenRuleShouldHavePath,
  thenRulePatternShouldMatch,
  thenRulePatternShouldNotMatch,
  thenMatchedRulesCountShouldBe,
} from "./steps/then.js";

describe("Rule Matching", () => {
  describe("when rules are provided", () => {
    describe("when file path matches single rule", () => {
      it("is expected to return matching rule", () => {
        const matchedRules = matchRules([SAMPLE_RULES.typescript], "src/test.ts");

        thenMatchedRulesCountShouldBe(matchedRules, 1);
        thenRuleShouldHaveName(matchedRules[0]!, "TypeScript");
      });
    });

    describe("when file path matches multiple rules", () => {
      it("is expected to return all matching rules", () => {
        const matchedRules = matchRules([SAMPLE_RULES.typescript, SAMPLE_RULES.testFiles], "src/component.test.ts");

        thenMatchedRulesCountShouldBe(matchedRules, 2);
        thenRuleShouldHaveName(matchedRules[0]!, "TypeScript");
        thenRuleShouldHaveName(matchedRules[1]!, "Test Files");
      });
    });

    describe("when file path matches no rules", () => {
      it("is expected to return empty array", () => {
        const matchedRules = matchRules([SAMPLE_RULES.javascript], "src/test.ts");

        thenMatchedRulesCountShouldBe(matchedRules, 0);
      });
    });

    describe("when testing against various paths", () => {
      it("is expected to match paths with directories", () => {
        const rules = [SAMPLE_RULES.typescript];
        const matchedRules = matchRules(rules, "src/components/Button.ts");

        thenMatchedRulesCountShouldBe(matchedRules, 1);
      });

      it("is expected to match root level files", () => {
        const rules = [SAMPLE_RULES.typescript];
        const matchedRules = matchRules(rules, "index.ts");

        thenMatchedRulesCountShouldBe(matchedRules, 1);
      });

      it("is expected to match deeply nested paths", () => {
        const rules = [SAMPLE_RULES.typescript];
        const matchedRules = matchRules(rules, "src/features/auth/components/LoginForm.ts");

        thenMatchedRulesCountShouldBe(matchedRules, 1);
      });
    });

    describe("when using all files pattern", () => {
      it("is expected to match any file path", () => {
        const rules = [SAMPLE_RULES.allFiles];

        thenRulesShouldMatch(rules, "any/file.ts", 1);
        thenRulesShouldMatch(rules, "test.js", 1);
        thenRulesShouldMatch(rules, "docs/README.md", 1);
        thenRulesShouldMatch(rules, "no-extension", 1);
      });
    });
  });

  describe("when no rules are provided", () => {
    it("is expected to return empty array", () => {
      const rules: ReturnType<typeof createRule>[] = [];
      const matchedRules = matchRules(rules, "src/test.ts");

      thenMatchedRulesCountShouldBe(matchedRules, 0);
    });
  });
});

describe("Rule Creation", () => {
  describe("when creating a rule", () => {
    it("is expected to generate reference with @ prefix", () => {
      const rule = createRule("Test Rule", /\.ts$/, "path/to/rubric.md");

      thenRuleShouldHaveReference(rule, "@path/to/rubric.md");
    });

    it("is expected to set all properties correctly", () => {
      const name = "TypeScript Files";
      const pattern = /\.ts$/;
      const path = "rubrics/typescript.md";

      const rule = createRule(name, pattern, path);

      thenRuleShouldHaveName(rule, name);
      thenRuleShouldHavePath(rule, path);
      thenRuleShouldHaveReference(rule, `@${path}`);
    });

    it("is expected to work with complex patterns", () => {
      const pattern = /^src\/.*\.test\.ts$/;
      const rule = createRule("Test Files", pattern, "testing.md");

      thenRulePatternShouldMatch(rule, "src/component.test.ts");
      thenRulePatternShouldNotMatch(rule, "tests/component.test.ts");
    });
  });
});
