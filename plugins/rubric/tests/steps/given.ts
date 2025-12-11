import type { Config } from "@claudekit/config";
import type { PostToolUseInput } from "@claudekit/hook";
import { vi } from "vitest";

export function givenHookInput(input: Partial<PostToolUseInput>): PostToolUseInput {
  const fullInput: PostToolUseInput = {
    hookEventName: input.hookEventName || ("PostToolUse" as any),
    toolName: input.toolName || "Edit",
    toolInput: input.toolInput || {},
    toolResponse: input.toolResponse || {},
  };

  return fullInput;
}

type MockFileEntry = {
  name: string;
  isDirectory: boolean;
  content?: string;
};

type MarkdownFile = {
  name: string;
  content: string;
};

export async function givenMarkdownFilesWithContent(files: MarkdownFile[]): Promise<void> {
  const fs = await import("node:fs");

  vi.mocked(fs.existsSync).mockReturnValue(true);
  vi.mocked(fs.readdirSync).mockReturnValue(
    files.map((file) => ({
      name: file.name,
      isDirectory: () => false,
      isFile: () => true,
    })) as any,
  );

  vi.mocked(fs.readFileSync).mockImplementation((path: any) => {
    const fileName = path.toString().split("/").pop();
    const file = files.find((f) => f.name === fileName);
    return file?.content || "";
  });
}

export async function givenNoRulesDirectory(): Promise<void> {
  const fs = await import("node:fs");
  vi.mocked(fs.existsSync).mockReturnValue(false);
}

export async function givenNestedDirectory(content: string = ""): Promise<void> {
  const fs = await import("node:fs");

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

  if (content) {
    vi.mocked(fs.readFileSync).mockReturnValue(content);
  }
}
