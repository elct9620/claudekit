import { describe, it } from "vitest";
import { loadRubricRules } from "../src/rubric.js";
import { SAMPLE_CONFIGS } from "./steps/fixtures.js";
import {
  thenRulesCountShouldBe,
  thenRuleShouldHaveName,
  thenRuleShouldHavePath,
  thenRulePatternShouldMatch,
  thenRulePatternShouldNotMatch,
  thenRuleShouldHaveReference,
  thenRulePatternShouldBeRegExp,
  thenAllRulePatternsShouldBeRegExp,
} from "./steps/then.js";

describe("Rubric Rule Loading", () => {
  describe("when config has rubric rules", () => {
    describe("when rule has name", () => {
      it("is expected to use configured name", () => {
        const rules = loadRubricRules(SAMPLE_CONFIGS.withEnforce);

        thenRulesCountShouldBe(rules, 1);
        thenRuleShouldHaveName(rules[0]!, "TypeScript Files");
      });
    });

    describe("when rule has no name", () => {
      it("is expected to use default name", () => {
        const rules = loadRubricRules(SAMPLE_CONFIGS.withCustomMessage);

        thenRulesCountShouldBe(rules, 1);
        thenRuleShouldHaveName(rules[0]!, "Unnamed Rule");
      });
    });

    describe("when rule pattern is regex string", () => {
      it("is expected to convert to RegExp", () => {
        const rules = loadRubricRules(SAMPLE_CONFIGS.withEnforce);

        thenRulesCountShouldBe(rules, 1);
        thenRulePatternShouldBeRegExp(rules[0]!);
        thenRulePatternShouldMatch(rules[0]!, "file.ts");
        thenRulePatternShouldNotMatch(rules[0]!, "file.js");
      });

      it("is expected to handle complex regex patterns", () => {
        const config = {
          rubric: {
            rules: [
              {
                pattern: "^src/.*\\.test\\.ts$",
                path: "testing.md",
              },
            ],
          },
        };

        const rules = loadRubricRules(config);

        thenRulePatternShouldMatch(rules[0]!, "src/component.test.ts");
        thenRulePatternShouldNotMatch(rules[0]!, "tests/component.test.ts");
      });
    });

    describe("when rule has path", () => {
      it("is expected to set path correctly", () => {
        const rules = loadRubricRules(SAMPLE_CONFIGS.withEnforce);

        thenRuleShouldHavePath(rules[0]!, "rubrics/typescript.md");
      });

      it("is expected to generate reference from path", () => {
        const rules = loadRubricRules(SAMPLE_CONFIGS.withEnforce);

        thenRuleShouldHaveReference(rules[0]!, "@rubrics/typescript.md");
      });
    });
  });

  describe("when config has no rubric rules", () => {
    it("is expected to return empty array", () => {
      const rules = loadRubricRules(SAMPLE_CONFIGS.empty);

      thenRulesCountShouldBe(rules, 0);
    });

    it("is expected to handle missing rubric config", () => {
      const rules = loadRubricRules({});

      thenRulesCountShouldBe(rules, 0);
    });
  });

  describe("when config has multiple rules", () => {
    it("is expected to load all rules", () => {
      const rules = loadRubricRules(SAMPLE_CONFIGS.withMultipleRules);

      thenRulesCountShouldBe(rules, 3);
      thenRuleShouldHaveName(rules[0]!, "TypeScript");
      thenRuleShouldHaveName(rules[1]!, "Test Files");
      thenRuleShouldHaveName(rules[2]!, "JavaScript");
    });

    it("is expected to maintain rule order", () => {
      const rules = loadRubricRules(SAMPLE_CONFIGS.withMultipleRules);

      thenRuleShouldHavePath(rules[0]!, "rubrics/typescript.md");
      thenRuleShouldHavePath(rules[1]!, "rubrics/testing.md");
      thenRuleShouldHavePath(rules[2]!, "rubrics/javascript.md");
    });

    it("is expected to convert all patterns to RegExp", () => {
      const rules = loadRubricRules(SAMPLE_CONFIGS.withMultipleRules);

      thenAllRulePatternsShouldBeRegExp(rules);
    });
  });

  describe("when config has rules with various patterns", () => {
    it("is expected to handle different file extensions", () => {
      const config = {
        rubric: {
          rules: [
            { pattern: "\\.ts$", path: "ts.md" },
            { pattern: "\\.js$", path: "js.md" },
            { pattern: "\\.tsx$", path: "tsx.md" },
            { pattern: "\\.json$", path: "json.md" },
          ],
        },
      };

      const rules = loadRubricRules(config);

      thenRulesCountShouldBe(rules, 4);
      thenRulePatternShouldMatch(rules[0]!, "file.ts");
      thenRulePatternShouldMatch(rules[1]!, "file.js");
      thenRulePatternShouldMatch(rules[2]!, "file.tsx");
      thenRulePatternShouldMatch(rules[3]!, "file.json");
    });

    it("is expected to handle directory-specific patterns", () => {
      const config = {
        rubric: {
          rules: [
            { pattern: "^src/", path: "src.md" },
            { pattern: "^tests/", path: "tests.md" },
          ],
        },
      };

      const rules = loadRubricRules(config);

      thenRulePatternShouldMatch(rules[0]!, "src/file.ts");
      thenRulePatternShouldNotMatch(rules[0]!, "tests/file.ts");
      thenRulePatternShouldMatch(rules[1]!, "tests/file.ts");
      thenRulePatternShouldNotMatch(rules[1]!, "src/file.ts");
    });

    it("is expected to handle wildcard patterns", () => {
      const config = {
        rubric: {
          rules: [{ pattern: ".*\\.test\\.(ts|js)$", path: "testing.md" }],
        },
      };

      const rules = loadRubricRules(config);

      thenRulePatternShouldMatch(rules[0]!, "file.test.ts");
      thenRulePatternShouldMatch(rules[0]!, "file.test.js");
      thenRulePatternShouldNotMatch(rules[0]!, "file.spec.ts");
    });
  });
});
