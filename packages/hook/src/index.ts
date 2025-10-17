export * from "./input.js";
export * from "./output.js";

import type { HookInput } from "./input.js";
import { HookEventName } from "./input.js";
import { BlockDecision, type PostToolUseOutput } from "./output.js";

/**
 * Convert snake_case keys to camelCase keys in a deeply nested object or array.
 */
function deepSnakeToCamel(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(deepSnakeToCamel);
  } else if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
          letter.toUpperCase(),
        );
        return [camelKey, deepSnakeToCamel(value)];
      }),
    );
  }
  return obj;
}

/**
 * Load and parse JSON input from a readable stream (default: stdin).
 *
 * @param source - The readable stream to read from. Defaults to process.stdin.
 * @returns input - The parsed JSON object with camelCase keys.
 */
export async function loadHook<T extends HookInput>(
  source: NodeJS.ReadableStream = process.stdin,
): Promise<T> {
  return new Promise((resolve, reject) => {
    let data = "";
    source.on("data", (chunk) => {
      data += chunk;
    });

    source.on("end", () => {
      try {
        const parsed = JSON.parse(data);
        const camelCased = deepSnakeToCamel(parsed);
        resolve(camelCased as T);
      } catch (error) {
        reject(new Error(`Unable to parse input as JSON: ${error}`));
      }
    });

    source.on("error", (error) => {
      reject(new Error(`Error reading input: ${error}`));
    });
  });
}

export function stop(isPass: boolean = true, reason?: string): string {
  return JSON.stringify({
    decision: isPass ? undefined : BlockDecision,
    reason,
  });
}

export function postToolUse(
  isPass: boolean = true,
  reason: string = "",
  additionalContext?: string,
): string {
  const output: PostToolUseOutput = {
    decision: isPass ? undefined : BlockDecision,
    reason,
  };

  if (additionalContext) {
    output.hookSpecificOutput = {
      hookEventName: HookEventName.PostToolUse,
      additionalContext,
    };
  }

  return JSON.stringify(output);
}
