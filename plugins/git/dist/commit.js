#!/usr/bin/env node
//#region ../../packages/config/src/index.ts
const CONFIG_SEARCH_PATHS = [
	".claude/claudekit.config.json",
	".claude/claudekit.json",
	"claudekit.config.json",
	"claudekit.json"
];

//#endregion
//#region src/commit.ts
console.log(JSON.stringify({ reason: `WIP: this hook is a work in progress, config is available at ${CONFIG_SEARCH_PATHS.join(`, `)}` }));

//#endregion
export {  };