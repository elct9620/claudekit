#!/usr/bin/env node
import fsAsync from "fs/promises";
import fs from "fs";

//#region ../../packages/config/src/index.ts
/**
* Paths to search for configuration files, in order of precedence.
*
* NOTE: claudekit is common name for the config file, we may expand to other names in the future.
*/
const CONFIG_SEARCH_PATHS = [
	"claudekit.config.json",
	"claudekit.json",
	".claude/claudekit.config.json",
	".claude/claudekit.json"
];
const LOCAL_CONFIG_SEARCH_PATHS = ["claudekit.local.json", ".claude/claudekit.local.json"];
function isConfigExists(path) {
	return fs.existsSync(path);
}
function deepMerge(target, source) {
	if (Array.isArray(target) && Array.isArray(source)) return source;
	else if (target !== null && typeof target === "object" && source !== null && typeof source === "object") {
		const merged = { ...target };
		for (const key of Object.keys(source)) if (key in target) merged[key] = deepMerge(target[key], source[key]);
		else merged[key] = source[key];
		return merged;
	}
	return source;
}
async function loadConfig() {
	const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();
	const configPath = CONFIG_SEARCH_PATHS.map((p) => `${projectRoot}/${p}`).find(isConfigExists);
	const localConfigPath = LOCAL_CONFIG_SEARCH_PATHS.map((p) => `${projectRoot}/${p}`).find(isConfigExists);
	const projectConfig = {};
	if (configPath) try {
		const fileContent = await fsAsync.readFile(configPath, "utf-8");
		Object.assign(projectConfig, JSON.parse(fileContent));
	} catch (error) {}
	const localConfig = {};
	if (localConfigPath) try {
		const fileContent = await fsAsync.readFile(localConfigPath, "utf-8");
		Object.assign(localConfig, JSON.parse(fileContent));
	} catch (error) {}
	return deepMerge(projectConfig, localConfig);
}

//#endregion
//#region ../../packages/hook/src/index.ts
const BlockDecision = "block";
/**
* Convert snake_case keys to camelCase keys in a deeply nested object or array.
*/
function deepSnakeToCamel(obj) {
	if (Array.isArray(obj)) return obj.map(deepSnakeToCamel);
	else if (obj !== null && typeof obj === "object") return Object.fromEntries(Object.entries(obj).map(([key, value]) => {
		return [key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()), deepSnakeToCamel(value)];
	}));
	return obj;
}
/**
* Load and parse JSON input from a readable stream (default: stdin).
*
* @param source - The readable stream to read from. Defaults to process.stdin.
* @returns input - The parsed JSON object with camelCase keys.
*/
async function loadHook(source = process.stdin) {
	return new Promise((resolve, reject) => {
		let data = "";
		source.on("data", (chunk) => {
			data += chunk;
		});
		source.on("end", () => {
			try {
				resolve(deepSnakeToCamel(JSON.parse(data)));
			} catch (error) {
				reject(/* @__PURE__ */ new Error(`Unable to parse input as JSON: ${error}`));
			}
		});
		source.on("error", (error) => {
			reject(/* @__PURE__ */ new Error(`Error reading input: ${error}`));
		});
	});
}
function stop(isAllow = true, reason) {
	return JSON.stringify({
		decision: isAllow ? void 0 : BlockDecision,
		reason
	});
}

//#endregion
//#region src/commit.ts
const config = await loadConfig();
await loadHook();
if (!(config.commit?.threshold.enabled ?? false)) {
	console.log(stop(true, `Commit hook is disabled in configuration`));
	process.exit(0);
}
const maxFilesChanged = config.commit?.threshold.maxFilesChanged ?? 10;
const maxLinesChanged = config.commit?.threshold.maxLinesChanged ?? 500;
config.commit?.threshold.logic;
console.log(stop(true, `Commit hook is enabled with maxFilesChanged=${maxFilesChanged} and maxLinesChanged=${maxLinesChanged}`));

//#endregion
export {  };