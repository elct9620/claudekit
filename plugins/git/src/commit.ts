#!/usr/bin/env node

import { loadConfig } from "@claudekit/config";
import { loadHook, stop, type StopInput } from "@claudekit/hook";

const config = await loadConfig();

const hook = await loadHook<StopInput>();

const isCommitHookEnabled = config.commit?.threshold.enabled ?? false;
if (!isCommitHookEnabled) {
  console.log(stop(true, `Commit hook is disabled in configuration`));
  process.exit(0);
}

const maxFilesChanged = config.commit?.threshold.maxFilesChanged ?? 10;
const maxLinesChanged = config.commit?.threshold.maxLinesChanged ?? 500;
const conditionLogic = config.commit?.threshold.logic ?? "OR";

console.log(
  stop(
    true,
    `Commit hook is enabled with maxFilesChanged=${maxFilesChanged} and maxLinesChanged=${maxLinesChanged}`,
  ),
);
