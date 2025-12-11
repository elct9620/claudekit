import { describe, it, expect, vi, beforeEach } from "vitest";
import { globToRegex, discoverRules } from "../src/rules.js";
import { SAMPLE_FRONTMATTER_FILES } from "./steps/fixtures.js";
import {
  thenPatternShouldMatch,
  thenPatternShouldNotMatch,
} from "./steps/then.js";

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
      it("is expected to create rule for each path pattern", async () => {
        const fs = await import("node:fs");

        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readdirSync).mockReturnValue([
          {
            name: "testing.md",
            isDirectory: () => false,
            isFile: () => true,
          } as any,
        ]);
        vi.mocked(fs.readFileSync).mockReturnValue(
          SAMPLE_FRONTMATTER_FILES.withPathsAndName,
        );

        const rules = discoverRules();

        expect(rules).toHaveLength(2);
        expect(rules[0]!.name).toBe("Testing Quality");
        expect(rules[0]!.pattern.test("src/file.test.ts")).toBe(true);
        expect(rules[1]!.pattern.test("src/file.spec.ts")).toBe(true);
      });
    });

    describe("when .md file has frontmatter with name", () => {
      it("is expected to use name from frontmatter", async () => {
        const fs = await import("node:fs");

        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readdirSync).mockReturnValue([
          {
            name: "global.md",
            isDirectory: () => false,
            isFile: () => true,
          } as any,
        ]);
        vi.mocked(fs.readFileSync).mockReturnValue(
          SAMPLE_FRONTMATTER_FILES.withNameOnly,
        );

        const rules = discoverRules();

        expect(rules).toHaveLength(1);
        expect(rules[0]!.name).toBe("Global Standards");
      });
    });

    describe("when .md file has no frontmatter", () => {
      it("is expected to use filename as name and match all files", async () => {
        const fs = await import("node:fs");

        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readdirSync).mockReturnValue([
          {
            name: "plain.md",
            isDirectory: () => false,
            isFile: () => true,
          } as any,
        ]);
        vi.mocked(fs.readFileSync).mockReturnValue(
          SAMPLE_FRONTMATTER_FILES.noFrontmatter,
        );

        const rules = discoverRules();

        expect(rules).toHaveLength(1);
        expect(rules[0]!.name).toBe("plain");
        expect(rules[0]!.pattern.test("any/file.ts")).toBe(true);
        expect(rules[0]!.pattern.test("anything")).toBe(true);
      });
    });

    describe("when .md file has frontmatter without paths", () => {
      it("is expected to create rule matching all files", async () => {
        const fs = await import("node:fs");

        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readdirSync).mockReturnValue([
          {
            name: "global.md",
            isDirectory: () => false,
            isFile: () => true,
          } as any,
        ]);
        vi.mocked(fs.readFileSync).mockReturnValue(
          SAMPLE_FRONTMATTER_FILES.withNameOnly,
        );

        const rules = discoverRules();

        expect(rules).toHaveLength(1);
        expect(rules[0]!.pattern.test("any/file.ts")).toBe(true);
        expect(rules[0]!.pattern.test("src/component.tsx")).toBe(true);
      });
    });

    describe("when .md file has empty frontmatter", () => {
      it("is expected to use filename and match all files", async () => {
        const fs = await import("node:fs");

        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readdirSync).mockReturnValue([
          {
            name: "empty.md",
            isDirectory: () => false,
            isFile: () => true,
          } as any,
        ]);
        vi.mocked(fs.readFileSync).mockReturnValue(
          SAMPLE_FRONTMATTER_FILES.emptyFrontmatter,
        );

        const rules = discoverRules();

        expect(rules).toHaveLength(1);
        expect(rules[0]!.name).toBe("empty");
        expect(rules[0]!.pattern.test("any/path")).toBe(true);
      });
    });
  });

  describe("when .claude/rules/ directory does not exist", () => {
    it("is expected to return empty array", async () => {
      const fs = await import("node:fs");

      vi.mocked(fs.existsSync).mockReturnValue(false);

      const rules = discoverRules();

      expect(rules).toHaveLength(0);
    });
  });

  describe("when .claude/rules/ has nested directories", () => {
    it("is expected to recursively scan subdirectories", async () => {
      const fs = await import("node:fs");
      const path = await import("node:path");

      vi.mocked(fs.existsSync).mockReturnValue(true);

      vi.mocked(fs.readdirSync).mockImplementation((dir: any) => {
        if (dir === ".claude/rules") {
          return [
            {
              name: "nested",
              isDirectory: () => true,
              isFile: () => false,
            } as any,
          ];
        }
        if (dir.includes("nested")) {
          return [
            {
              name: "rule.md",
              isDirectory: () => false,
              isFile: () => true,
            } as any,
          ];
        }
        return [];
      });

      vi.mocked(fs.readFileSync).mockReturnValue(
        SAMPLE_FRONTMATTER_FILES.noFrontmatter,
      );

      const rules = discoverRules();

      expect(rules).toHaveLength(1);
      expect(rules[0]!.name).toBe("rule");
      expect(rules[0]!.path).toContain("nested");
    });
  });

  describe("when directory has multiple files", () => {
    it("is expected to discover all markdown files", async () => {
      const fs = await import("node:fs");

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([
        {
          name: "testing.md",
          isDirectory: () => false,
          isFile: () => true,
        } as any,
        {
          name: "readme.md",
          isDirectory: () => false,
          isFile: () => true,
        } as any,
        {
          name: "not-markdown.txt",
          isDirectory: () => false,
          isFile: () => true,
        } as any,
      ]);

      vi.mocked(fs.readFileSync).mockReturnValue(
        SAMPLE_FRONTMATTER_FILES.noFrontmatter,
      );

      const rules = discoverRules();

      expect(rules).toHaveLength(2);
      expect(rules[0]!.name).toBe("testing");
      expect(rules[1]!.name).toBe("readme");
    });
  });
});
