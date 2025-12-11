import { describe, it, expect } from "vitest";
import { createRule, matchRules } from "../src/core.js";
import { SAMPLE_RULES } from "./steps/fixtures.js";
import { thenRulesShouldMatch, thenRuleShouldHaveReference } from "./steps/then.js";

describe("Rule Matching", () => {
  describe("when rules are provided", () => {
    describe("when file path matches single rule", () => {
      it("is expected to return matching rule", () => {
        const rules = [SAMPLE_RULES.typescript];
        const filePath = "src/test.ts";

        const matchedRules = matchRules(rules, filePath);

        expect(matchedRules).toHaveLength(1);
        expect(matchedRules[0]!.name).toBe("TypeScript");
      });
    });

    describe("when file path matches multiple rules", () => {
      it("is expected to return all matching rules", () => {
        const rules = [SAMPLE_RULES.typescript, SAMPLE_RULES.testFiles];
        const filePath = "src/component.test.ts";

        const matchedRules = matchRules(rules, filePath);

        expect(matchedRules).toHaveLength(2);
        expect(matchedRules[0]!.name).toBe("TypeScript");
        expect(matchedRules[1]!.name).toBe("Test Files");
      });
    });

    describe("when file path matches no rules", () => {
      it("is expected to return empty array", () => {
        const rules = [SAMPLE_RULES.javascript];
        const filePath = "src/test.ts";

        const matchedRules = matchRules(rules, filePath);

        expect(matchedRules).toHaveLength(0);
      });
    });

    describe("when testing against various paths", () => {
      it("is expected to match paths with directories", () => {
        const rules = [SAMPLE_RULES.typescript];
        const filePath = "src/components/Button.ts";

        const matchedRules = matchRules(rules, filePath);

        expect(matchedRules).toHaveLength(1);
      });

      it("is expected to match root level files", () => {
        const rules = [SAMPLE_RULES.typescript];
        const filePath = "index.ts";

        const matchedRules = matchRules(rules, filePath);

        expect(matchedRules).toHaveLength(1);
      });

      it("is expected to match deeply nested paths", () => {
        const rules = [SAMPLE_RULES.typescript];
        const filePath = "src/features/auth/components/LoginForm.ts";

        const matchedRules = matchRules(rules, filePath);

        expect(matchedRules).toHaveLength(1);
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
      const filePath = "src/test.ts";

      const matchedRules = matchRules(rules, filePath);

      expect(matchedRules).toHaveLength(0);
    });
  });
});

describe("Rule Creation", () => {
  describe("when creating a rule", () => {
    it("is expected to generate reference with @ prefix", () => {
      const rule = createRule("Test Rule", /\.ts$/, "path/to/rubric.md");

      thenRuleShouldHaveReference(rule, "path/to/rubric.md");
    });

    it("is expected to set all properties correctly", () => {
      const name = "TypeScript Files";
      const pattern = /\.ts$/;
      const path = "rubrics/typescript.md";

      const rule = createRule(name, pattern, path);

      expect(rule.name).toBe(name);
      expect(rule.pattern).toBe(pattern);
      expect(rule.path).toBe(path);
      expect(rule.reference).toBe(`@${path}`);
    });

    it("is expected to work with complex patterns", () => {
      const pattern = /^src\/.*\.test\.ts$/;
      const rule = createRule("Test Files", pattern, "testing.md");

      expect(rule.pattern.test("src/component.test.ts")).toBe(true);
      expect(rule.pattern.test("tests/component.test.ts")).toBe(false);
    });
  });
});
