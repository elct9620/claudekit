#!/usr/bin/env node
import fsAsync from "fs/promises";
import fs from "fs";
import { exec } from "child_process";

//#region ../../packages/config/src/schema.ts
let CommitLogic = /* @__PURE__ */ function(CommitLogic$1) {
	CommitLogic$1["AND"] = "AND";
	CommitLogic$1["OR"] = "OR";
	return CommitLogic$1;
}({});

//#endregion
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
function stop(isPass = true, reason) {
	return JSON.stringify({
		decision: isPass ? void 0 : BlockDecision,
		reason
	});
}

//#endregion
//#region src/git.ts
async function isGitAvailable() {
	try {
		return new Promise((resolve) => {
			exec("git status", (error) => {
				resolve(!error);
			});
		});
	} catch {
		return false;
	}
}
async function getChangedFilesCount() {
	return new Promise((resolve, reject) => {
		exec("git status --porcelain", (error, stdout) => {
			if (error) {
				reject(error);
				return;
			}
			resolve(stdout.split("\n").filter((line) => line.trim() !== "").length);
		});
	});
}
async function getChangedLinesCount() {
	return new Promise((resolve, reject) => {
		exec("git diff --numstat", (error, stdout) => {
			if (error) {
				reject(error);
				return;
			}
			resolve(stdout.split("\n").filter((line) => line.trim() !== "").map((line) => {
				const parts = line.split("	");
				const added = parseInt(parts[0] || "0", 10);
				const deleted = parseInt(parts[1] || "0", 10);
				return (isNaN(added) ? 0 : added) + (isNaN(deleted) ? 0 : deleted);
			}).reduce((acc, curr) => acc + curr, 0));
		});
	});
}
async function getUntrackedLinesCount() {
	return new Promise((resolve, reject) => {
		exec("git ls-files --others --exclude-standard | xargs wc -l", (error, stdout) => {
			if (error) {
				reject(error);
				return;
			}
			resolve(stdout.split("\n").filter((line) => line.trim() !== "" && !line.includes("total")).map((line) => {
				const parts = line.trim().split(/\s+/);
				return parseInt(parts[0] || "0", 10);
			}).reduce((acc, curr) => acc + curr, 0));
		});
	});
}

//#endregion
//#region src/commit.ts
const DEFAULT_BLOCK_REASON = "There are too many changes {changedFiles}/{maxChangedFiles} changed files and {totalChangedLines}/{maxChangedLines} changed lines in the working directory. Please review and commit your changes before proceeding.";
const config = await loadConfig();
if (!(config.commit?.threshold.enabled ?? false)) {
	console.log(stop(true, `Commit hook is disabled in configuration`));
	process.exit(0);
}
if (!await isGitAvailable()) {
	console.log(stop(true, `Git is not available in the current project`));
	process.exit(0);
}
if ((await loadHook()).stopHookActive) {
	console.log(stop(true, `Commit hook is skipped because stop hook is active`));
	process.exit(0);
}
const maxFilesChanged = config.commit?.threshold.maxFilesChanged ?? 10;
const maxLinesChanged = config.commit?.threshold.maxLinesChanged ?? 500;
const conditionLogic = config.commit?.threshold.logic ?? CommitLogic.OR;
const stopReasonTemplate = config.commit?.threshold.blockReason ?? DEFAULT_BLOCK_REASON;
const changedFiles = await getChangedFilesCount();
const changedLines = await getChangedLinesCount();
const untrackedLines = await getUntrackedLinesCount();
const isExceededFiles = changedFiles >= maxFilesChanged;
const isExceededLines = changedLines + untrackedLines >= maxLinesChanged;
const isBlocked = conditionLogic === CommitLogic.AND ? isExceededFiles && isExceededLines : isExceededFiles || isExceededLines;
console.log(stop(!isBlocked, stopReasonTemplate.replace("{changedFiles}", changedFiles.toString()).replace("{maxChangedFiles}", maxFilesChanged.toString()).replace("{changedLines}", changedLines.toString()).replace("{untrackedLines}", untrackedLines.toString()).replace("{totalChangedLines}", (changedLines + untrackedLines).toString()).replace("{maxChangedLines}", maxLinesChanged.toString())));

//#endregion
export {  };