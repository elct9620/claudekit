#!/usr/bin/env node

import { loadConfig } from "@claudekit/config";

const config = await loadConfig();

const isCommitHookEnabled = config.commit?.threshold.enabled ?? false;

console.log(
  JSON.stringify({
    reason: `WIP: this hook is a work in progress, hook is ${isCommitHookEnabled ? "enabled" : "disabled"}`,
  }),
);
