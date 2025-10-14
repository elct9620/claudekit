#!/usr/bin/env node

import { loadConfig, CommitLogic } from "@claudekit/config";
import { loadHook, stop, type StopInput } from "@claudekit/hook";
import {
  getChangedFilesCount,
  getChangedLinesCount,
  getUntrackedLinesCount,
  isGitAvailable,
} from "./git.js";

const DEFAULT_BLOCK_REASON =
  "There are too many changes {changedFiles}/{maxChangedFiles} changed files and {totalChangedLines}/{maxChangedLines} changed lines in the working directory. Please review and commit your changes before proceeding.";

const config = await loadConfig();

const isCommitHookEnabled = config.commit?.threshold.enabled ?? false;
if (!isCommitHookEnabled) {
  console.log(stop(true, `Commit hook is disabled in configuration`));
  process.exit(0);
}

if (!(await isGitAvailable())) {
  console.log(stop(true, `Git is not available in the current project`));
  process.exit(0);
}

const hook = await loadHook<StopInput>();
if (hook.stopHookActive) {
  console.log(stop(true, `Commit hook is skipped because stop hook is active`));
  process.exit(0);
}

const maxFilesChanged = config.commit?.threshold.maxFilesChanged ?? 10;
const maxLinesChanged = config.commit?.threshold.maxLinesChanged ?? 500;
const conditionLogic = config.commit?.threshold.logic ?? CommitLogic.OR;
const stopReasonTemplate =
  config.commit?.threshold.blockReason ?? DEFAULT_BLOCK_REASON;

const changedFiles = await getChangedFilesCount();
const changedLines = await getChangedLinesCount();
const untrackedLines = await getUntrackedLinesCount();

const isExceededFiles = changedFiles >= maxFilesChanged;
const isExceededLines = changedLines + untrackedLines >= maxLinesChanged;
const isBlocked =
  conditionLogic === CommitLogic.AND
    ? isExceededFiles && isExceededLines
    : isExceededFiles || isExceededLines;

console.log(
  stop(
    !isBlocked,
    stopReasonTemplate
      .replace("{changedFiles}", changedFiles.toString())
      .replace("{maxChangedFiles}", maxFilesChanged.toString())
      .replace("{changedLines}", changedLines.toString())
      .replace("{untrackedLines}", untrackedLines.toString())
      .replace(
        "{totalChangedLines}",
        (changedLines + untrackedLines).toString(),
      )
      .replace("{maxChangedLines}", maxLinesChanged.toString()),
  ),
);
