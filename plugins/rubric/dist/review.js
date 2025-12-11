#!/usr/bin/env node
import fsAsync from "fs/promises";
import fs from "fs";
import * as fs$1 from "node:fs";
import * as path from "node:path";

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
function isConfigExists(path$1) {
	return fs.existsSync(path$1);
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
	} catch (error) {
		throw new Error(`Failed to parse config file at ${configPath}: ${error}`);
	}
	const localConfig = {};
	if (localConfigPath) try {
		const fileContent = await fsAsync.readFile(localConfigPath, "utf-8");
		Object.assign(localConfig, JSON.parse(fileContent));
	} catch (error) {
		throw new Error(`Failed to parse local config file at ${localConfigPath}: ${error}`);
	}
	return deepMerge(projectConfig, localConfig);
}

//#endregion
//#region ../../packages/hook/src/input.ts
let HookEventName = /* @__PURE__ */ function(HookEventName$1) {
	HookEventName$1["Stop"] = "Stop";
	HookEventName$1["PostToolUse"] = "PostToolUse";
	return HookEventName$1;
}({});

//#endregion
//#region ../../packages/hook/src/output.ts
const BlockDecision = "block";

//#endregion
//#region ../../packages/hook/src/index.ts
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
//#region src/core.ts
function createRule(name, pattern, path$1) {
	return {
		name,
		pattern,
		path: path$1,
		reference: `@${path$1}`
	};
}
function matchRules(rules, filePath$1) {
	return rules.filter((rule) => rule.pattern.test(filePath$1));
}

//#endregion
//#region src/rules.ts
const RULES_DIR = ".claude/rules";
/**
* Parse YAML frontmatter to extract paths field
*/
function parseFrontmatter(content) {
	const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!match?.[1]) return null;
	const pathsMatch = match[1].match(/^paths:\s*(.+)$/m);
	if (!pathsMatch?.[1]) return null;
	return pathsMatch[1].trim().split(/,\s*/).map((p) => p.trim());
}
/**
* Convert glob pattern to RegExp
*/
function globToRegex(glob) {
	let regex = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&");
	regex = regex.replace(/\*\*/g, "\0");
	regex = regex.replace(/\*/g, "[^/]*");
	regex = regex.replace(/\0/g, ".*");
	return /* @__PURE__ */ new RegExp(`^${regex}$`);
}
/**
* Discover rules from .claude/rules/ directory
*/
function discoverRules() {
	if (!fs$1.existsSync(RULES_DIR)) return [];
	const rules = [];
	function scanDir(dir) {
		const entries = fs$1.readdirSync(dir, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name);
			if (entry.isDirectory()) scanDir(fullPath);
			else if (entry.isFile() && entry.name.endsWith(".md")) {
				const patterns = parseFrontmatter(fs$1.readFileSync(fullPath, "utf-8"));
				const name = path.basename(fullPath, ".md");
				if (patterns === null) rules.push(createRule(name, /.*/, fullPath));
				else for (const pattern of patterns) rules.push(createRule(name, globToRegex(pattern), fullPath));
			}
		}
	}
	scanDir(RULES_DIR);
	return rules;
}

//#endregion
//#region src/rubric.ts
/**
* Load rules from rubric config
*/
function loadRubricRules(config$1) {
	return (config$1.rubric?.rules ?? []).map((rule) => createRule(rule.name || "Unnamed Rule", new RegExp(rule.pattern), rule.path));
}

//#endregion
//#region src/review.ts
const SUPPORTED_TOOL_NAMES = ["Edit", "Write"];
const DEFAULT_REVIEW_MESSAGE = "Ensure review changes against {references} and resolve violations until reached criteria requirements defined in the rubric.";
const hook = await loadHook();
if (!SUPPORTED_TOOL_NAMES.includes(hook.toolName)) process.exit(0);
const config = await loadConfig();
const filePath = hook.toolInput.filePath;
const rubricRules = loadRubricRules(config);
const discoveredRules = discoverRules();
const matchedRules = matchRules([...rubricRules, ...discoveredRules], filePath);
if (matchedRules.length === 0) {
	console.log(postToolUse(true));
	process.exit(0);
}
const references = matchedRules.map((rule) => rule.reference);
const reviewMessage = (config.rubric?.reviewMessage || DEFAULT_REVIEW_MESSAGE).replace("{references}", references.join(", "));
if (config.rubric?.enforce ?? true) console.log(postToolUse(false, reviewMessage));
else console.log(postToolUse(true, "The changes match rubric rules.", reviewMessage));

//#endregion
export {  };