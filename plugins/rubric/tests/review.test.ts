import { describe, it, expect, vi, beforeEach } from "vitest";
import { postToolUse } from "@claudekit/hook";
import { matchRules } from "../src/core.js";
import { loadRubricRules } from "../src/rubric.js";
import { SAMPLE_CONFIGS, SAMPLE_RULES } from "./steps/fixtures.js";
import {
  thenHookOutputShouldAllow,
  thenHookOutputShouldBlock,
  thenHookOutputShouldHaveAdditionalContext,
  thenHookOutputShouldIncludeReferences,
} from "./steps/then.js";

describe("Review Hook Integration", () => {
  const DEFAULT_REVIEW_MESSAGE =
    "Ensure review changes against {references} and resolve violations until reached criteria requirements defined in the rubric.";

  describe("when file matches config-based rule", () => {
    describe("when enforce mode is enabled", () => {
      it("is expected to block with review message", () => {
        const rules = loadRubricRules(SAMPLE_CONFIGS.withEnforce);
        const filePath = "src/test.ts";
        const matchedRules = matchRules(rules, filePath);

        expect(matchedRules.length).toBeGreaterThan(0);

        const references = matchedRules.map((rule) => rule.reference);
        const reviewMessage = DEFAULT_REVIEW_MESSAGE.replace(
          "{references}",
          references.join(", "),
        );

        const output = postToolUse(false, reviewMessage);

        thenHookOutputShouldBlock(output, "@rubrics/typescript.md");
      });

      it("is expected to include rule reference in message", () => {
        const rules = loadRubricRules(SAMPLE_CONFIGS.withEnforce);
        const filePath = "src/component.ts";
        const matchedRules = matchRules(rules, filePath);

        const references = matchedRules.map((rule) => rule.reference);
        const reviewMessage = DEFAULT_REVIEW_MESSAGE.replace(
          "{references}",
          references.join(", "),
        );

        const output = postToolUse(false, reviewMessage);

        thenHookOutputShouldIncludeReferences(output, "rubrics/typescript.md");
      });
    });

    describe("when enforce mode is disabled", () => {
      it("is expected to allow with additional context", () => {
        const rules = loadRubricRules(SAMPLE_CONFIGS.withoutEnforce);
        const filePath = "src/test.ts";
        const matchedRules = matchRules(rules, filePath);

        expect(matchedRules.length).toBeGreaterThan(0);

        const references = matchedRules.map((rule) => rule.reference);
        const reviewMessage = DEFAULT_REVIEW_MESSAGE.replace(
          "{references}",
          references.join(", "),
        );

        const output = postToolUse(
          true,
          "The changes match rubric rules.",
          reviewMessage,
        );

        thenHookOutputShouldHaveAdditionalContext(output, "@rubrics/typescript.md");
      });

      it("is expected to include warning in additional context", () => {
        const rules = loadRubricRules(SAMPLE_CONFIGS.withoutEnforce);
        const filePath = "src/utils.ts";
        const matchedRules = matchRules(rules, filePath);

        const references = matchedRules.map((rule) => rule.reference);
        const reviewMessage = DEFAULT_REVIEW_MESSAGE.replace(
          "{references}",
          references.join(", "),
        );

        const output = postToolUse(
          true,
          "The changes match rubric rules.",
          reviewMessage,
        );

        const parsed = JSON.parse(output);
        expect(parsed.decision).toBeUndefined();
        expect(parsed.hookSpecificOutput?.additionalContext).toContain(
          "Ensure review changes against",
        );
      });
    });

    describe("when custom review message is configured", () => {
      it("is expected to use custom template with references", () => {
        const rules = loadRubricRules(SAMPLE_CONFIGS.withCustomMessage);
        const filePath = "src/app.ts";
        const matchedRules = matchRules(rules, filePath);

        expect(matchedRules.length).toBeGreaterThan(0);

        const references = matchedRules.map((rule) => rule.reference);
        const customMessage =
          SAMPLE_CONFIGS.withCustomMessage.rubric!.reviewMessage!;
        const reviewMessage = customMessage.replace(
          "{references}",
          references.join(", "),
        );

        const output = postToolUse(false, reviewMessage);

        thenHookOutputShouldBlock(output, "Please review against");
        thenHookOutputShouldBlock(output, "@rubrics/typescript.md");
      });
    });
  });

  describe("when file matches multiple rules", () => {
    it("is expected to include all references in message", () => {
      const rules = loadRubricRules(SAMPLE_CONFIGS.withMultipleRules);
      const filePath = "src/component.test.ts";
      const matchedRules = matchRules(rules, filePath);

      expect(matchedRules).toHaveLength(2);

      const references = matchedRules.map((rule) => rule.reference);
      const reviewMessage = DEFAULT_REVIEW_MESSAGE.replace(
        "{references}",
        references.join(", "),
      );

      const output = postToolUse(false, reviewMessage);

      thenHookOutputShouldIncludeReferences(
        output,
        "rubrics/typescript.md",
        "rubrics/testing.md",
      );
    });

    it("is expected to join references with comma separator", () => {
      const rules = [
        SAMPLE_RULES.typescript,
        SAMPLE_RULES.testFiles,
        SAMPLE_RULES.javascript,
      ];
      const filePath = "file.test.ts";
      const matchedRules = matchRules(rules, filePath);

      const references = matchedRules.map((rule) => rule.reference);
      expect(references.join(", ")).toBe(
        "@rubrics/typescript.md, @rubrics/testing.md",
      );
    });
  });

  describe("when file matches both config and discovered rules", () => {
    it("is expected to merge rules from both sources", () => {
      const configRules = loadRubricRules(SAMPLE_CONFIGS.withEnforce);
      const discoveredRules = [SAMPLE_RULES.allFiles];
      const allRules = [...configRules, ...discoveredRules];

      const filePath = "src/test.ts";
      const matchedRules = matchRules(allRules, filePath);

      expect(matchedRules).toHaveLength(2);

      const references = matchedRules.map((rule) => rule.reference);
      const reviewMessage = DEFAULT_REVIEW_MESSAGE.replace(
        "{references}",
        references.join(", "),
      );

      const output = postToolUse(false, reviewMessage);

      thenHookOutputShouldIncludeReferences(
        output,
        "rubrics/typescript.md",
        ".claude/rules/global.md",
      );
    });
  });

  describe("when file matches no rules", () => {
    it("is expected to allow without message", () => {
      const rules = loadRubricRules(SAMPLE_CONFIGS.withEnforce);
      const filePath = "README.md";
      const matchedRules = matchRules(rules, filePath);

      expect(matchedRules).toHaveLength(0);

      const output = postToolUse(true);

      thenHookOutputShouldAllow(output);
    });

    it("is expected to have undefined decision", () => {
      const rules = loadRubricRules(SAMPLE_CONFIGS.withMultipleRules);
      const filePath = "package.json";
      const matchedRules = matchRules(rules, filePath);

      expect(matchedRules).toHaveLength(0);

      const output = postToolUse(true);
      const parsed = JSON.parse(output);

      expect(parsed.decision).toBeUndefined();
      expect(parsed.reason).toBe("");
    });
  });

  describe("when building review messages", () => {
    it("is expected to replace placeholder with references", () => {
      const template = "Review changes against {references}";
      const references = ["@file1.md", "@file2.md"];
      const message = template.replace("{references}", references.join(", "));

      expect(message).toBe("Review changes against @file1.md, @file2.md");
    });

    it("is expected to handle single reference", () => {
      const template = "Review against {references}";
      const references = ["@rubric.md"];
      const message = template.replace("{references}", references.join(", "));

      expect(message).toBe("Review against @rubric.md");
    });

    it("is expected to preserve message structure", () => {
      const template =
        "Before {references} after with criteria requirements.";
      const references = ["@test.md"];
      const message = template.replace("{references}", references.join(", "));

      expect(message).toBe("Before @test.md after with criteria requirements.");
    });
  });

  describe("when comparing enforce modes", () => {
    it("is expected to block in enforce mode", () => {
      const rules = loadRubricRules(SAMPLE_CONFIGS.withEnforce);
      const matchedRules = matchRules(rules, "test.ts");
      expect(matchedRules.length).toBeGreaterThan(0);

      const output = postToolUse(false, "Block reason");
      const parsed = JSON.parse(output);

      expect(parsed.decision).toBe("block");
      expect(SAMPLE_CONFIGS.withEnforce.rubric?.enforce).toBe(true);
    });

    it("is expected to allow in warning mode", () => {
      const rules = loadRubricRules(SAMPLE_CONFIGS.withoutEnforce);
      const matchedRules = matchRules(rules, "test.ts");
      expect(matchedRules.length).toBeGreaterThan(0);

      const output = postToolUse(true, "Warning", "Additional context");
      const parsed = JSON.parse(output);

      expect(parsed.decision).toBeUndefined();
      expect(parsed.hookSpecificOutput?.additionalContext).toBeDefined();
      expect(SAMPLE_CONFIGS.withoutEnforce.rubric?.enforce).toBe(false);
    });
  });

  describe("when processing different file types", () => {
    it("is expected to match TypeScript files", () => {
      const rules = loadRubricRules(SAMPLE_CONFIGS.withMultipleRules);

      expect(matchRules(rules, "component.ts")).toHaveLength(1);
      expect(matchRules(rules, "utils.ts")).toHaveLength(1);
      expect(matchRules(rules, "src/index.ts")).toHaveLength(1);
    });

    it("is expected to match JavaScript files", () => {
      const rules = loadRubricRules(SAMPLE_CONFIGS.withMultipleRules);

      expect(matchRules(rules, "script.js")).toHaveLength(1);
      expect(matchRules(rules, "src/app.js")).toHaveLength(1);
    });

    it("is expected to match test files to multiple rules", () => {
      const rules = loadRubricRules(SAMPLE_CONFIGS.withMultipleRules);

      const matches = matchRules(rules, "component.test.ts");
      expect(matches).toHaveLength(2);
      expect(matches[0]!.name).toBe("TypeScript");
      expect(matches[1]!.name).toBe("Test Files");
    });

    it("is expected to not match unrelated files", () => {
      const rules = loadRubricRules(SAMPLE_CONFIGS.withMultipleRules);

      expect(matchRules(rules, "README.md")).toHaveLength(0);
      expect(matchRules(rules, "package.json")).toHaveLength(0);
      expect(matchRules(rules, "image.png")).toHaveLength(0);
    });
  });

  describe("when validating message format", () => {
    it("is expected to create valid JSON output", () => {
      const output = postToolUse(false, "Test reason");

      expect(() => JSON.parse(output)).not.toThrow();
    });

    it("is expected to include all required fields for block", () => {
      const output = postToolUse(false, "Block message");
      const parsed = JSON.parse(output);

      expect(parsed).toHaveProperty("decision");
      expect(parsed).toHaveProperty("reason");
      expect(parsed.decision).toBe("block");
      expect(parsed.reason).toBe("Block message");
    });

    it("is expected to include additional context when provided", () => {
      const output = postToolUse(true, "Reason", "Additional context");
      const parsed = JSON.parse(output);

      expect(parsed.hookSpecificOutput).toHaveProperty("additionalContext");
      expect(parsed.hookSpecificOutput?.additionalContext).toBe(
        "Additional context",
      );
    });
  });
});
