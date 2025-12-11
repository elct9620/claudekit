import { describe, it, expect } from "vitest";
import { loadRubricRules } from "../src/rubric.js";
import { SAMPLE_CONFIGS } from "./steps/fixtures.js";

describe("Rubric Rule Loading", () => {
  describe("when config has rubric rules", () => {
    describe("when rule has name", () => {
      it("is expected to use configured name", () => {
        const rules = loadRubricRules(SAMPLE_CONFIGS.withEnforce);

        expect(rules).toHaveLength(1);
        expect(rules[0]!.name).toBe("TypeScript Files");
      });
    });

    describe("when rule has no name", () => {
      it("is expected to use default name", () => {
        const rules = loadRubricRules(SAMPLE_CONFIGS.withCustomMessage);

        expect(rules).toHaveLength(1);
        expect(rules[0]!.name).toBe("Unnamed Rule");
      });
    });

    describe("when rule pattern is regex string", () => {
      it("is expected to convert to RegExp", () => {
        const rules = loadRubricRules(SAMPLE_CONFIGS.withEnforce);

        expect(rules).toHaveLength(1);
        expect(rules[0]!.pattern).toBeInstanceOf(RegExp);
        expect(rules[0]!.pattern.test("file.ts")).toBe(true);
        expect(rules[0]!.pattern.test("file.js")).toBe(false);
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

        expect(rules[0]!.pattern.test("src/component.test.ts")).toBe(true);
        expect(rules[0]!.pattern.test("tests/component.test.ts")).toBe(false);
      });
    });

    describe("when rule has path", () => {
      it("is expected to set path correctly", () => {
        const rules = loadRubricRules(SAMPLE_CONFIGS.withEnforce);

        expect(rules[0]!.path).toBe("rubrics/typescript.md");
      });

      it("is expected to generate reference from path", () => {
        const rules = loadRubricRules(SAMPLE_CONFIGS.withEnforce);

        expect(rules[0]!.reference).toBe("@rubrics/typescript.md");
      });
    });
  });

  describe("when config has no rubric rules", () => {
    it("is expected to return empty array", () => {
      const rules = loadRubricRules(SAMPLE_CONFIGS.empty);

      expect(rules).toHaveLength(0);
    });

    it("is expected to handle missing rubric config", () => {
      const config = {};
      const rules = loadRubricRules(config);

      expect(rules).toHaveLength(0);
    });
  });

  describe("when config has multiple rules", () => {
    it("is expected to load all rules", () => {
      const rules = loadRubricRules(SAMPLE_CONFIGS.withMultipleRules);

      expect(rules).toHaveLength(3);
      expect(rules[0]!.name).toBe("TypeScript");
      expect(rules[1]!.name).toBe("Test Files");
      expect(rules[2]!.name).toBe("JavaScript");
    });

    it("is expected to maintain rule order", () => {
      const rules = loadRubricRules(SAMPLE_CONFIGS.withMultipleRules);

      expect(rules[0]!.path).toBe("rubrics/typescript.md");
      expect(rules[1]!.path).toBe("rubrics/testing.md");
      expect(rules[2]!.path).toBe("rubrics/javascript.md");
    });

    it("is expected to convert all patterns to RegExp", () => {
      const rules = loadRubricRules(SAMPLE_CONFIGS.withMultipleRules);

      expect(rules.every((rule) => rule.pattern instanceof RegExp)).toBe(true);
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

      expect(rules).toHaveLength(4);
      expect(rules[0]!.pattern.test("file.ts")).toBe(true);
      expect(rules[1]!.pattern.test("file.js")).toBe(true);
      expect(rules[2]!.pattern.test("file.tsx")).toBe(true);
      expect(rules[3]!.pattern.test("file.json")).toBe(true);
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

      expect(rules[0]!.pattern.test("src/file.ts")).toBe(true);
      expect(rules[0]!.pattern.test("tests/file.ts")).toBe(false);
      expect(rules[1]!.pattern.test("tests/file.ts")).toBe(true);
      expect(rules[1]!.pattern.test("src/file.ts")).toBe(false);
    });

    it("is expected to handle wildcard patterns", () => {
      const config = {
        rubric: {
          rules: [{ pattern: ".*\\.test\\.(ts|js)$", path: "testing.md" }],
        },
      };

      const rules = loadRubricRules(config);

      expect(rules[0]!.pattern.test("file.test.ts")).toBe(true);
      expect(rules[0]!.pattern.test("file.test.js")).toBe(true);
      expect(rules[0]!.pattern.test("file.spec.ts")).toBe(false);
    });
  });
});
