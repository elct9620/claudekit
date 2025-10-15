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
let HookEventName = /* @__PURE__ */ function(HookEventName$1) {
	HookEventName$1["Stop"] = "Stop";
	HookEventName$1["PostToolUse"] = "PostToolUse";
	return HookEventName$1;
}({});
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
function postToolUse(isPass = true, reason = "", additionalContext) {
	const output = {
		decision: isPass ? void 0 : BlockDecision,
		reason
	};
	if (additionalContext) output.hookSpecificOutput = {
		hookEventName: HookEventName.PostToolUse,
		additionalContext
	};
	return JSON.stringify(output);
}

//#endregion
//#region src/review.ts
const SUPPORTED_TOOL_NAMES = [
	"Edit",
	"Write",
	"MultiWrite"
];
const DEFAULT_REVIEW_MESSAGE = "Ensure review changes against {references}, fix rubrics violations and keep the code clean before proceeding.";
const hook = await loadHook();
if (!SUPPORTED_TOOL_NAMES.includes(hook.toolName)) process.exit(0);
const config = await loadConfig();
if (!Boolean(config.rubric)) process.exit(0);
const filePath = hook.toolInput.filePath;
const messageTemplate = config.rubric?.reviewMessage || DEFAULT_REVIEW_MESSAGE;
const matches = (config.rubric?.rules ?? []).map((rule) => ({
	name: rule.name || "Unnamed Rule",
	pattern: new RegExp(rule.pattern),
	path: rule.path,
	reference: `@${rule.path}`
})).filter((rule) => rule.pattern.test(filePath));
const references = matches.map((rule) => rule.reference);
if (matches.length === 0) {
	console.log(postToolUse(true));
	process.exit(0);
}
const isEnforced = config.rubric?.enforce ?? true;
const reviewMessage = messageTemplate.replace("{references}", references.join(", "));
if (isEnforced) {
	console.log(postToolUse(false, reviewMessage));
	process.exit(0);
}
console.log(postToolUse(true, "The changes match rubric rules.", reviewMessage));

//#endregion
export {  };