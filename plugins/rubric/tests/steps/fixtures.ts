import type { Config } from "@claudekit/config";
import type { PostToolUseInput } from "@claudekit/hook";
import { HookEventName } from "@claudekit/hook";
import type { Rule } from "../../src/core.js";

export const SAMPLE_CONFIGS: {
  empty: Config;
  withEnforce: Config;
  withoutEnforce: Config;
  withCustomMessage: Config;
  withMultipleRules: Config;
} = {
  empty: {},
  withEnforce: {
    rubric: {
      enforce: true,
      rules: [
        {
          name: "TypeScript Files",
          pattern: "\\.ts$",
          path: "rubrics/typescript.md",
        },
      ],
    },
  },
  withoutEnforce: {
    rubric: {
      enforce: false,
      rules: [
        {
          name: "TypeScript Files",
          pattern: "\\.ts$",
          path: "rubrics/typescript.md",
        },
      ],
    },
  },
  withCustomMessage: {
    rubric: {
      enforce: true,
      reviewMessage: "Please review against {references} for quality standards.",
      rules: [
        {
          pattern: "\\.ts$",
          path: "rubrics/typescript.md",
        },
      ],
    },
  },
  withMultipleRules: {
    rubric: {
      enforce: true,
      rules: [
        {
          name: "TypeScript",
          pattern: "\\.ts$",
          path: "rubrics/typescript.md",
        },
        {
          name: "Test Files",
          pattern: "\\.test\\.ts$",
          path: "rubrics/testing.md",
        },
        {
          name: "JavaScript",
          pattern: "\\.js$",
          path: "rubrics/javascript.md",
        },
      ],
    },
  },
};

export const SAMPLE_HOOK_INPUTS: {
  editTypeScript: PostToolUseInput;
  writeTypeScript: PostToolUseInput;
  editJavaScript: PostToolUseInput;
  readTool: PostToolUseInput;
  bashTool: PostToolUseInput;
  editTestFile: PostToolUseInput;
  noFilePath: PostToolUseInput;
} = {
  editTypeScript: {
    hookEventName: HookEventName.PostToolUse,
    toolName: "Edit",
    toolInput: {
      filePath: "src/test.ts",
    },
    toolResponse: {},
  },
  writeTypeScript: {
    hookEventName: HookEventName.PostToolUse,
    toolName: "Write",
    toolInput: {
      filePath: "src/new.ts",
    },
    toolResponse: {},
  },
  editJavaScript: {
    hookEventName: HookEventName.PostToolUse,
    toolName: "Edit",
    toolInput: {
      filePath: "src/test.js",
    },
    toolResponse: {},
  },
  readTool: {
    hookEventName: HookEventName.PostToolUse,
    toolName: "Read",
    toolInput: {
      filePath: "src/test.ts",
    },
    toolResponse: {},
  },
  bashTool: {
    hookEventName: HookEventName.PostToolUse,
    toolName: "Bash",
    toolInput: {
      command: "ls",
    },
    toolResponse: {},
  },
  editTestFile: {
    hookEventName: HookEventName.PostToolUse,
    toolName: "Edit",
    toolInput: {
      filePath: "src/component.test.ts",
    },
    toolResponse: {},
  },
  noFilePath: {
    hookEventName: HookEventName.PostToolUse,
    toolName: "Edit",
    toolInput: {},
    toolResponse: {},
  },
};

export const SAMPLE_RULES: {
  typescript: Rule;
  testFiles: Rule;
  javascript: Rule;
  allFiles: Rule;
} = {
  typescript: {
    name: "TypeScript",
    pattern: /\.ts$/,
    path: "rubrics/typescript.md",
    reference: "@rubrics/typescript.md",
  },
  testFiles: {
    name: "Test Files",
    pattern: /\.test\.ts$/,
    path: "rubrics/testing.md",
    reference: "@rubrics/testing.md",
  },
  javascript: {
    name: "JavaScript",
    pattern: /\.js$/,
    path: "rubrics/javascript.md",
    reference: "@rubrics/javascript.md",
  },
  allFiles: {
    name: "Global Rules",
    pattern: /.*/,
    path: ".claude/rules/global.md",
    reference: "@.claude/rules/global.md",
  },
};

export const SAMPLE_FRONTMATTER_FILES = {
  withPathsAndName: `---
name: Testing Quality
paths: **/*.test.ts, **/*.spec.ts
---

# Testing Quality

This document outlines the criteria for evaluating the quality of tests.
`,
  withNameOnly: `---
name: Global Standards
---

# Global Standards

These standards apply to all files.
`,
  withPathsOnly: `---
paths: *.md, **/*.md
---

# Documentation Standards
`,
  noFrontmatter: `# Plain Document

This has no frontmatter.
`,
  emptyFrontmatter: `---
---

# Empty Frontmatter
`,
  withBraceExpansion: `---
name: Testing Quality
paths: **/tests/**/*.{ts,js}
---

# Testing Quality

Tests with brace expansion in path pattern.
`,
  withMultiplePatternsAndBraces: `---
name: Code Quality
paths: {src,lib}/**/*.{ts,tsx}, tests/**/*.test.ts
---

# Code Quality

Multiple patterns with brace expansion.
`,
};
