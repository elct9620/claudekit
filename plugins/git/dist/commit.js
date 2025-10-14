#!/usr/bin/env node
import fs from "fs/promises";

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
async function isConfigExists(path) {
	return fs.access(path, fs.constants.F_OK).then(() => true).catch(() => false);
}
async function loadConfig() {
	const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.env.CLAUDE_PLUGIN_ROOT || process.cwd();
	const configPath = CONFIG_SEARCH_PATHS.map((p) => `${projectRoot}/${p}`).find((p) => isConfigExists(p));
	if (!configPath) return {};
	try {
		const configContent = await fs.readFile(configPath, "utf-8");
		return JSON.parse(configContent);
	} catch (e) {
		return {};
	}
}

//#endregion
//#region src/commit.ts
const isCommitHookEnabled = (await loadConfig()).commit?.threshold.enabled ?? false;
console.log(JSON.stringify({ reason: `WIP: this hook is a work in progress, hook is ${isCommitHookEnabled ? "enabled" : "disabled"}` }));

//#endregion
export {  };