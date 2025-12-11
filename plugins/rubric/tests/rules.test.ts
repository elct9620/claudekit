import { describe, it, expect, vi, beforeEach } from "vitest";
import { globToRegex, discoverRules } from "../src/rules.js";
import { SAMPLE_FRONTMATTER_FILES } from "./steps/fixtures.js";
import {
  thenPatternShouldMatch,
  thenPatternShouldNotMatch,
  thenRulesCountShouldBe,
  thenRuleShouldHaveName,
} from "./steps/then.js";
import {
  givenMarkdownFilesWithContent,
  givenNoRulesDirectory,
  givenNestedDirectory,
} from "./steps/given.js";

vi.mock("node:fs");

describe("Glob to Regex Conversion", () => {
  describe("when glob pattern contains *", () => {
    it("is expected to match any characters except /", () => {
      const glob = "*.ts";
      const regex = globToRegex(glob);

      thenPatternShouldMatch(regex, "file.ts");
      thenPatternShouldMatch(regex, "test.ts");
      thenPatternShouldNotMatch(regex, "dir/file.ts");
      thenPatternShouldNotMatch(regex, "a/b/file.ts");
    });

    it("is expected to work with patterns in middle", () => {
      const glob = "src/*.ts";
      const regex = globToRegex(glob);

      thenPatternShouldMatch(regex, "src/file.ts");
      thenPatternShouldNotMatch(regex, "src/nested/file.ts");
      thenPatternShouldNotMatch(regex, "other/file.ts");
    });
  });

  describe("when glob pattern contains **", () => {
    it("is expected to match zero or more directories", () => {
      const glob = "**/*.ts";
      const regex = globToRegex(glob);

      thenPatternShouldMatch(regex, "file.ts");
      thenPatternShouldMatch(regex, "a/file.ts");
      thenPatternShouldMatch(regex, "a/b/c/file.ts");
      thenPatternShouldMatch(regex, "src/components/Button.ts");
    });

    it("is expected to work with directory prefix", () => {
      const glob = "src/**/*.test.ts";
      const regex = globToRegex(glob);

      thenPatternShouldMatch(regex, "src/test.test.ts");
      thenPatternShouldMatch(regex, "src/components/Button.test.ts");
      thenPatternShouldMatch(regex, "src/a/b/c/deep.test.ts");
      thenPatternShouldNotMatch(regex, "tests/unit.test.ts");
    });
  });

  describe("when glob pattern contains brace expansion", () => {
    it("is expected to match any option in braces", () => {
      const glob = "*.{ts,js}";
      const regex = globToRegex(glob);

      thenPatternShouldMatch(regex, "file.ts");
      thenPatternShouldMatch(regex, "file.js");
      thenPatternShouldNotMatch(regex, "file.py");
      thenPatternShouldNotMatch(regex, "file.md");
    });

    it("is expected to work with multiple options", () => {
      const glob = "*.{test.ts,spec.ts,test.js}";
      const regex = globToRegex(glob);

      thenPatternShouldMatch(regex, "file.test.ts");
      thenPatternShouldMatch(regex, "file.spec.ts");
      thenPatternShouldMatch(regex, "file.test.js");
      thenPatternShouldNotMatch(regex, "file.ts");
    });

    it("is expected to combine with ** pattern", () => {
      const glob = "**/*.{ts,tsx}";
      const regex = globToRegex(glob);

      thenPatternShouldMatch(regex, "Component.ts");
      thenPatternShouldMatch(regex, "Component.tsx");
      thenPatternShouldMatch(regex, "src/Component.tsx");
      thenPatternShouldNotMatch(regex, "Component.js");
    });
  });

  describe("when glob pattern contains special characters", () => {
    it("is expected to escape regex special characters", () => {
      const glob = "file.test.ts";
      const regex = globToRegex(glob);

      thenPatternShouldMatch(regex, "file.test.ts");
      thenPatternShouldNotMatch(regex, "file-test-ts");
      thenPatternShouldNotMatch(regex, "filextestxts");
    });

    it("is expected to handle dots correctly", () => {
      const glob = "*.test.ts";
      const regex = globToRegex(glob);

      thenPatternShouldMatch(regex, "component.test.ts");
      thenPatternShouldMatch(regex, "utils.test.ts");
      thenPatternShouldNotMatch(regex, "componentXtestXts");
    });

    it("is expected to handle parentheses", () => {
      const glob = "file(1).ts";
      const regex = globToRegex(glob);

      thenPatternShouldMatch(regex, "file(1).ts");
      thenPatternShouldNotMatch(regex, "file1.ts");
    });
  });

  describe("when glob pattern is complex", () => {
    it("is expected to handle mixed patterns", () => {
      const glob = "src/**/*.{test,spec}.ts";
      const regex = globToRegex(glob);

      thenPatternShouldMatch(regex, "src/utils.test.ts");
      thenPatternShouldMatch(regex, "src/utils.spec.ts");
      thenPatternShouldMatch(regex, "src/components/Button.test.ts");
      thenPatternShouldNotMatch(regex, "src/utils.ts");
      thenPatternShouldNotMatch(regex, "tests/utils.test.ts");
    });

    it("is expected to match testing.md pattern for test files", () => {
      const glob = "**/tests/**/*.{ts,js}";
      const regex = globToRegex(glob);

      thenPatternShouldMatch(regex, "tests/core.test.ts");
      thenPatternShouldMatch(regex, "tests/steps/fixtures.ts");
      thenPatternShouldMatch(regex, "plugins/rubric/tests/review.test.ts");
      thenPatternShouldMatch(regex, "src/tests/unit/test.js");
      thenPatternShouldNotMatch(regex, "src/test.ts");
      thenPatternShouldNotMatch(regex, ".claude/rules/testing.md");
    });
  });
});

describe("Rule Discovery", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("when .claude/rules/ directory exists", () => {
    describe("when .md file has frontmatter with paths", () => {
      it("is expected to create two rules from paths array", async () => {
        await givenMarkdownFilesWithContent([
          { name: "testing.md", content: SAMPLE_FRONTMATTER_FILES.withPathsAndName },
        ]);

        const rules = discoverRules();

        thenRulesCountShouldBe(rules, 2);
      });

      it("is expected to use name from frontmatter for each rule", async () => {
        await givenMarkdownFilesWithContent([
          { name: "testing.md", content: SAMPLE_FRONTMATTER_FILES.withPathsAndName },
        ]);

        const rules = discoverRules();

        thenRuleShouldHaveName(rules[0]!, "Testing Quality");
      });

      it("is expected to match test file patterns correctly", async () => {
        await givenMarkdownFilesWithContent([
          { name: "testing.md", content: SAMPLE_FRONTMATTER_FILES.withPathsAndName },
        ]);

        const rules = discoverRules();

        thenPatternShouldMatch(rules[0]!.pattern, "src/file.test.ts");
        thenPatternShouldMatch(rules[1]!.pattern, "src/file.spec.ts");
      });
    });

    describe("when .md file has frontmatter with name", () => {
      it("is expected to create single rule", async () => {
        await givenMarkdownFilesWithContent([
          { name: "global.md", content: SAMPLE_FRONTMATTER_FILES.withNameOnly },
        ]);

        const rules = discoverRules();

        thenRulesCountShouldBe(rules, 1);
      });

      it("is expected to use name from frontmatter", async () => {
        await givenMarkdownFilesWithContent([
          { name: "global.md", content: SAMPLE_FRONTMATTER_FILES.withNameOnly },
        ]);

        const rules = discoverRules();

        thenRuleShouldHaveName(rules[0]!, "Global Standards");
      });
    });

    describe("when .md file has no frontmatter", () => {
      it("is expected to create single rule from plain file", async () => {
        await givenMarkdownFilesWithContent([
          { name: "plain.md", content: SAMPLE_FRONTMATTER_FILES.noFrontmatter },
        ]);

        const rules = discoverRules();

        thenRulesCountShouldBe(rules, 1);
      });

      it("is expected to use filename as name", async () => {
        await givenMarkdownFilesWithContent([
          { name: "plain.md", content: SAMPLE_FRONTMATTER_FILES.noFrontmatter },
        ]);

        const rules = discoverRules();

        thenRuleShouldHaveName(rules[0]!, "plain");
      });

      it("is expected to match all file patterns", async () => {
        await givenMarkdownFilesWithContent([
          { name: "plain.md", content: SAMPLE_FRONTMATTER_FILES.noFrontmatter },
        ]);

        const rules = discoverRules();

        thenPatternShouldMatch(rules[0]!.pattern, "any/file.ts");
        thenPatternShouldMatch(rules[0]!.pattern, "anything");
      });
    });

    describe("when .md file has frontmatter without paths", () => {
      it("is expected to create single rule", async () => {
        await givenMarkdownFilesWithContent([
          { name: "global.md", content: SAMPLE_FRONTMATTER_FILES.withNameOnly },
        ]);

        const rules = discoverRules();

        thenRulesCountShouldBe(rules, 1);
      });

      it("is expected to match all files", async () => {
        await givenMarkdownFilesWithContent([
          { name: "global.md", content: SAMPLE_FRONTMATTER_FILES.withNameOnly },
        ]);

        const rules = discoverRules();

        thenPatternShouldMatch(rules[0]!.pattern, "any/file.ts");
        thenPatternShouldMatch(rules[0]!.pattern, "src/component.tsx");
      });
    });

    describe("when .md file has empty frontmatter", () => {
      it("is expected to create single rule", async () => {
        await givenMarkdownFilesWithContent([
          { name: "empty.md", content: SAMPLE_FRONTMATTER_FILES.emptyFrontmatter },
        ]);

        const rules = discoverRules();

        thenRulesCountShouldBe(rules, 1);
      });

      it("is expected to use filename as name", async () => {
        await givenMarkdownFilesWithContent([
          { name: "empty.md", content: SAMPLE_FRONTMATTER_FILES.emptyFrontmatter },
        ]);

        const rules = discoverRules();

        thenRuleShouldHaveName(rules[0]!, "empty");
      });

      it("is expected to match all paths", async () => {
        await givenMarkdownFilesWithContent([
          { name: "empty.md", content: SAMPLE_FRONTMATTER_FILES.emptyFrontmatter },
        ]);

        const rules = discoverRules();

        thenPatternShouldMatch(rules[0]!.pattern, "any/path");
      });
    });

    describe("when .md file has brace expansion in paths", () => {
      it("is expected to create single rule from brace pattern", async () => {
        await givenMarkdownFilesWithContent([
          { name: "testing.md", content: SAMPLE_FRONTMATTER_FILES.withBraceExpansion },
        ]);

        const rules = discoverRules();

        thenRulesCountShouldBe(rules, 1);
      });

      it("is expected to use name from frontmatter", async () => {
        await givenMarkdownFilesWithContent([
          { name: "testing.md", content: SAMPLE_FRONTMATTER_FILES.withBraceExpansion },
        ]);

        const rules = discoverRules();

        thenRuleShouldHaveName(rules[0]!, "Testing Quality");
      });

      it("is expected to match files with different extensions", async () => {
        await givenMarkdownFilesWithContent([
          { name: "testing.md", content: SAMPLE_FRONTMATTER_FILES.withBraceExpansion },
        ]);

        const rules = discoverRules();

        thenPatternShouldMatch(rules[0]!.pattern, "tests/core.test.ts");
        thenPatternShouldMatch(rules[0]!.pattern, "tests/utils.test.js");
        thenPatternShouldMatch(rules[0]!.pattern, "plugins/rubric/tests/review.test.ts");
      });

      it("is expected to create two rules from multiple patterns", async () => {
        await givenMarkdownFilesWithContent([
          { name: "code.md", content: SAMPLE_FRONTMATTER_FILES.withMultiplePatternsAndBraces },
        ]);

        const rules = discoverRules();

        thenRulesCountShouldBe(rules, 2);
      });

      it("is expected to match first pattern with braces", async () => {
        await givenMarkdownFilesWithContent([
          { name: "code.md", content: SAMPLE_FRONTMATTER_FILES.withMultiplePatternsAndBraces },
        ]);

        const rules = discoverRules();

        thenPatternShouldMatch(rules[0]!.pattern, "src/index.ts");
        thenPatternShouldMatch(rules[0]!.pattern, "lib/utils.tsx");
      });

      it("is expected to match second pattern", async () => {
        await givenMarkdownFilesWithContent([
          { name: "code.md", content: SAMPLE_FRONTMATTER_FILES.withMultiplePatternsAndBraces },
        ]);

        const rules = discoverRules();

        thenPatternShouldMatch(rules[1]!.pattern, "tests/core.test.ts");
      });

      it("is expected to create single rule from nested braces", async () => {
        await givenMarkdownFilesWithContent([
          {
            name: "complex.md",
            content: `---
paths: src/**/*.{test,spec}.{ts,js}
---`,
          },
        ]);

        const rules = discoverRules();

        thenRulesCountShouldBe(rules, 1);
      });

      it("is expected to match nested brace patterns", async () => {
        await givenMarkdownFilesWithContent([
          {
            name: "complex.md",
            content: `---
paths: src/**/*.{test,spec}.{ts,js}
---`,
          },
        ]);

        const rules = discoverRules();

        thenPatternShouldMatch(rules[0]!.pattern, "src/utils.test.ts");
        thenPatternShouldMatch(rules[0]!.pattern, "src/utils.spec.js");
      });
    });
  });

  describe("when .claude/rules/ directory does not exist", () => {
    it("is expected to return empty array", async () => {
      await givenNoRulesDirectory();

      const rules = discoverRules();

      thenRulesCountShouldBe(rules, 0);
    });
  });

  describe("when .claude/rules/ has nested directories", () => {
    it("is expected to find single rule in nested directory", async () => {
      await givenNestedDirectory(SAMPLE_FRONTMATTER_FILES.noFrontmatter);

      const rules = discoverRules();

      thenRulesCountShouldBe(rules, 1);
    });

    it("is expected to use filename for nested rule", async () => {
      await givenNestedDirectory(SAMPLE_FRONTMATTER_FILES.noFrontmatter);

      const rules = discoverRules();

      thenRuleShouldHaveName(rules[0]!, "rule");
    });
  });

  describe("when directory has multiple files", () => {
    it("is expected to discover two markdown files", async () => {
      await givenMarkdownFilesWithContent([
        { name: "testing.md", content: SAMPLE_FRONTMATTER_FILES.noFrontmatter },
        { name: "readme.md", content: SAMPLE_FRONTMATTER_FILES.noFrontmatter },
        { name: "not-markdown.txt", content: "" },
      ]);

      const rules = discoverRules();

      thenRulesCountShouldBe(rules, 2);
    });

    it("is expected to use filenames for rule names", async () => {
      await givenMarkdownFilesWithContent([
        { name: "testing.md", content: SAMPLE_FRONTMATTER_FILES.noFrontmatter },
        { name: "readme.md", content: SAMPLE_FRONTMATTER_FILES.noFrontmatter },
        { name: "not-markdown.txt", content: "" },
      ]);

      const rules = discoverRules();

      thenRuleShouldHaveName(rules[0]!, "testing");
      thenRuleShouldHaveName(rules[1]!, "readme");
    });
  });
});
