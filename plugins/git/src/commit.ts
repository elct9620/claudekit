#!/usr/bin/env node

import { CONFIG_SEARCH_PATHS } from "@claudekit/config";

console.log(
  JSON.stringify({
    reason: `WIP: this hook is a work in progress, config is available at ${CONFIG_SEARCH_PATHS.join(`, `)}`,
  }),
);
