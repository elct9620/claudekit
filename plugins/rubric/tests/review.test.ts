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
  thenMatchedRulesCountShouldBe,
  thenReferencesJoinedShouldBe,
  thenMessageShouldBe,
} from "./steps/then.js";
import {
  whenMatchingFileAgainstConfig,
  whenBuildingReviewMessage,
} from "./steps/when.js";

describe("Review Hook Integration", () => {
  const DEFAULT_REVIEW_MESSAGE =
    "Ensure review changes against {references} and resolve violations until reached criteria requirements defined in the rubric.";

  describe("when file matches config-based rule", () => {
    describe("when enforce mode is enabled", () => {
      it("is expected to block with review message", () => {
        const matchedRules = whenMatchingFileAgainstConfig(SAMPLE_CONFIGS.withEnforce, "src/test.ts");
        const reviewMessage = whenBuildingReviewMessage(matchedRules, DEFAULT_REVIEW_MESSAGE);
        const output = postToolUse(false, reviewMessage);

        thenHookOutputShouldBlock(output, "@rubrics/typescript.md");
      });

      it("is expected to include rule reference in message", () => {
        const matchedRules = whenMatchingFileAgainstConfig(SAMPLE_CONFIGS.withEnforce, "src/component.ts");
        const reviewMessage = whenBuildingReviewMessage(matchedRules, DEFAULT_REVIEW_MESSAGE);
        const output = postToolUse(false, reviewMessage);

        thenHookOutputShouldIncludeReferences(output, "rubrics/typescript.md");
      });
    });

    describe("when enforce mode is disabled", () => {
      it("is expected to allow with additional context", () => {
        const matchedRules = whenMatchingFileAgainstConfig(SAMPLE_CONFIGS.withoutEnforce, "src/test.ts");
        const reviewMessage = whenBuildingReviewMessage(matchedRules, DEFAULT_REVIEW_MESSAGE);
        const output = postToolUse(true, "The changes match rubric rules.", reviewMessage);

        thenHookOutputShouldHaveAdditionalContext(output, "@rubrics/typescript.md");
      });

      it("is expected to include warning in additional context", () => {
        const matchedRules = whenMatchingFileAgainstConfig(SAMPLE_CONFIGS.withoutEnforce, "src/utils.ts");
        const reviewMessage = whenBuildingReviewMessage(matchedRules, DEFAULT_REVIEW_MESSAGE);
        const output = postToolUse(true, "The changes match rubric rules.", reviewMessage);

        thenHookOutputShouldHaveAdditionalContext(output, "Ensure review changes against");
      });
    });

    describe("when custom review message is configured", () => {
      it("is expected to use custom template with references", () => {
        const matchedRules = whenMatchingFileAgainstConfig(SAMPLE_CONFIGS.withCustomMessage, "src/app.ts");
        const customMessage = SAMPLE_CONFIGS.withCustomMessage.rubric!.reviewMessage!;
        const reviewMessage = whenBuildingReviewMessage(matchedRules, customMessage);
        const output = postToolUse(false, reviewMessage);

        thenHookOutputShouldBlock(output, "Please review against");
        thenHookOutputShouldBlock(output, "@rubrics/typescript.md");
      });
    });
  });

  describe("when file matches multiple rules", () => {
    it("is expected to match multiple rules", () => {
      const matchedRules = whenMatchingFileAgainstConfig(SAMPLE_CONFIGS.withMultipleRules, "src/component.test.ts");

      thenMatchedRulesCountShouldBe(matchedRules, 2);
    });

    it("is expected to include all references in message", () => {
      const matchedRules = whenMatchingFileAgainstConfig(SAMPLE_CONFIGS.withMultipleRules, "src/component.test.ts");
      const reviewMessage = whenBuildingReviewMessage(matchedRules, DEFAULT_REVIEW_MESSAGE);
      const output = postToolUse(false, reviewMessage);

      thenHookOutputShouldIncludeReferences(output, "rubrics/typescript.md", "rubrics/testing.md");
    });

    it("is expected to join references with comma separator", () => {
      const rules = [SAMPLE_RULES.typescript, SAMPLE_RULES.testFiles, SAMPLE_RULES.javascript];
      const matchedRules = matchRules(rules, "file.test.ts");
      const references = matchedRules.map((rule) => rule.reference);

      thenReferencesJoinedShouldBe(references, "@rubrics/typescript.md, @rubrics/testing.md");
    });
  });

  describe("when file matches both config and discovered rules", () => {
    it("is expected to match rules from both sources", () => {
      const configRules = loadRubricRules(SAMPLE_CONFIGS.withEnforce);
      const discoveredRules = [SAMPLE_RULES.allFiles];
      const allRules = [...configRules, ...discoveredRules];
      const matchedRules = matchRules(allRules, "src/test.ts");

      thenMatchedRulesCountShouldBe(matchedRules, 2);
    });

    it("is expected to include references from both sources in message", () => {
      const configRules = loadRubricRules(SAMPLE_CONFIGS.withEnforce);
      const discoveredRules = [SAMPLE_RULES.allFiles];
      const allRules = [...configRules, ...discoveredRules];
      const matchedRules = matchRules(allRules, "src/test.ts");
      const reviewMessage = whenBuildingReviewMessage(matchedRules, DEFAULT_REVIEW_MESSAGE);
      const output = postToolUse(false, reviewMessage);

      thenHookOutputShouldIncludeReferences(output, "rubrics/typescript.md", ".claude/rules/global.md");
    });
  });

  describe("when file matches no rules", () => {
    it("is expected to match zero rules", () => {
      const matchedRules = whenMatchingFileAgainstConfig(SAMPLE_CONFIGS.withEnforce, "README.md");

      thenMatchedRulesCountShouldBe(matchedRules, 0);
    });

    it("is expected to allow without message", () => {
      const output = postToolUse(true);

      thenHookOutputShouldAllow(output);
    });
  });

  describe("when building review messages", () => {
    it("is expected to replace placeholder with references", () => {
      const template = "Review changes against {references}";
      const references = ["@file1.md", "@file2.md"];
      const message = template.replace("{references}", references.join(", "));

      thenMessageShouldBe(message, "Review changes against @file1.md, @file2.md");
    });

    it("is expected to handle single reference", () => {
      const template = "Review against {references}";
      const references = ["@rubric.md"];
      const message = template.replace("{references}", references.join(", "));

      thenMessageShouldBe(message, "Review against @rubric.md");
    });

    it("is expected to preserve message structure", () => {
      const template = "Before {references} after with criteria requirements.";
      const references = ["@test.md"];
      const message = template.replace("{references}", references.join(", "));

      thenMessageShouldBe(message, "Before @test.md after with criteria requirements.");
    });
  });

  describe("when comparing enforce modes", () => {
    it("is expected to block in enforce mode", () => {
      const output = postToolUse(false, "Block reason");

      thenHookOutputShouldBlock(output, "Block reason");
    });

    it("is expected to allow in warning mode", () => {
      const output = postToolUse(true, "Warning", "Additional context");

      thenHookOutputShouldHaveAdditionalContext(output, "Additional context");
    });
  });

  describe("when processing different file types", () => {
    it("is expected to match TypeScript component files", () => {
      const matchedRules = whenMatchingFileAgainstConfig(SAMPLE_CONFIGS.withMultipleRules, "component.ts");

      thenMatchedRulesCountShouldBe(matchedRules, 1);
    });

    it("is expected to match TypeScript utility files", () => {
      const matchedRules = whenMatchingFileAgainstConfig(SAMPLE_CONFIGS.withMultipleRules, "utils.ts");

      thenMatchedRulesCountShouldBe(matchedRules, 1);
    });

    it("is expected to match nested TypeScript files", () => {
      const matchedRules = whenMatchingFileAgainstConfig(SAMPLE_CONFIGS.withMultipleRules, "src/index.ts");

      thenMatchedRulesCountShouldBe(matchedRules, 1);
    });

    it("is expected to match JavaScript script files", () => {
      const matchedRules = whenMatchingFileAgainstConfig(SAMPLE_CONFIGS.withMultipleRules, "script.js");

      thenMatchedRulesCountShouldBe(matchedRules, 1);
    });

    it("is expected to match nested JavaScript files", () => {
      const matchedRules = whenMatchingFileAgainstConfig(SAMPLE_CONFIGS.withMultipleRules, "src/app.js");

      thenMatchedRulesCountShouldBe(matchedRules, 1);
    });

    it("is expected to match test files to multiple rules", () => {
      const matchedRules = whenMatchingFileAgainstConfig(SAMPLE_CONFIGS.withMultipleRules, "component.test.ts");

      thenMatchedRulesCountShouldBe(matchedRules, 2);
    });

    it("is expected to not match README files", () => {
      const matchedRules = whenMatchingFileAgainstConfig(SAMPLE_CONFIGS.withMultipleRules, "README.md");

      thenMatchedRulesCountShouldBe(matchedRules, 0);
    });

    it("is expected to not match package.json files", () => {
      const matchedRules = whenMatchingFileAgainstConfig(SAMPLE_CONFIGS.withMultipleRules, "package.json");

      thenMatchedRulesCountShouldBe(matchedRules, 0);
    });

    it("is expected to not match image files", () => {
      const matchedRules = whenMatchingFileAgainstConfig(SAMPLE_CONFIGS.withMultipleRules, "image.png");

      thenMatchedRulesCountShouldBe(matchedRules, 0);
    });
  });

  describe("when validating message format", () => {
    it("is expected to include all required fields for block", () => {
      const output = postToolUse(false, "Block message");

      thenHookOutputShouldBlock(output, "Block message");
    });

    it("is expected to include additional context when provided", () => {
      const output = postToolUse(true, "Reason", "Additional context");

      thenHookOutputShouldHaveAdditionalContext(output, "Additional context");
    });
  });
});
