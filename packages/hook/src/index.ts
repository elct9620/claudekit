type SharedInput = {
  hookEventName: string;
};

export type StopInput = SharedInput & {
  hookEventName: "Stop";
  stopHookActive: boolean;
};

export type HookInput = StopInput;

export const BlockDecision = "block";

type SharedOutput = {};

export type StopOutput = SharedOutput & {
  decision: typeof BlockDecision | undefined;
  reason?: string;
};

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
): Promise<HookInput> {
  return new Promise((resolve, reject) => {
    let data = "";
    source.on("data", (chunk) => {
      data += chunk;
    });

    source.on("end", () => {
      try {
        const parsed = JSON.parse(data);
        const camelCased = deepSnakeToCamel(parsed);
        resolve(camelCased as HookInput);
      } catch (error) {
        reject(new Error(`Unable to parse input as JSON: ${error}`));
      }
    });

    source.on("error", (error) => {
      reject(new Error(`Error reading input: ${error}`));
    });
  });
}

export function stop(isAllow: boolean = true, reason?: string): string {
  return JSON.stringify({
    decision: isAllow ? undefined : BlockDecision,
    reason,
  });
}
