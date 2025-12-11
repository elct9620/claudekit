import type { Config } from "@claudekit/config";
import type { PostToolUseInput } from "@claudekit/hook";
import { vi } from "vitest";

export function givenConfig(config: Partial<Config>): void {
  const { loadConfig } = vi.hoisted(() => {
    return { loadConfig: vi.fn() };
  });

  vi.mocked(loadConfig).mockResolvedValue(config as Config);
}

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

type MockDirectory = {
  [key: string]: MockFileEntry[];
};

export function givenDiscoveredRules(mockDirectory: MockDirectory): void {
  const fs = vi.hoisted(() => {
    return {
      existsSync: vi.fn(),
      readdirSync: vi.fn(),
      readFileSync: vi.fn(),
    };
  });

  vi.mocked(fs.existsSync).mockImplementation((path: string) => {
    return path in mockDirectory;
  });

  vi.mocked(fs.readdirSync).mockImplementation((path: string) => {
    const entries = mockDirectory[path as string] || [];
    return entries.map((entry) => ({
      name: entry.name,
      isDirectory: () => entry.isDirectory,
      isFile: () => !entry.isDirectory,
    })) as any;
  });

  vi.mocked(fs.readFileSync).mockImplementation((path: string) => {
    for (const dir in mockDirectory) {
      const entry = mockDirectory[dir]!.find((e) => path.toString().endsWith(e.name));
      if (entry?.content) {
        return entry.content;
      }
    }
    return "";
  });
}

export function givenNoDiscoveredRules(): void {
  const fs = vi.hoisted(() => {
    return {
      existsSync: vi.fn(),
      readdirSync: vi.fn(),
      readFileSync: vi.fn(),
    };
  });

  vi.mocked(fs.existsSync).mockReturnValue(false);
}
