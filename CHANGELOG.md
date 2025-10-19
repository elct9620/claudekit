# Changelog

## [0.4.0](https://github.com/elct9620/claudekit/compare/claudekit-v0.3.0...claudekit-v0.4.0) (2025-10-19)


### Features

* add hono plugin to marketplace ([25345fb](https://github.com/elct9620/claudekit/commit/25345fbf08471fa46397c71a5bd98ca127275dec))
* **rubric:** improve config command with explicit user confirmations ([eb657d4](https://github.com/elct9620/claudekit/commit/eb657d4e7bc1257c3663c46aed4934e14a23b929))

## [0.3.0](https://github.com/elct9620/claudekit/compare/claudekit-v0.2.0...claudekit-v0.3.0) (2025-10-18)


### Features

* add create-plugin skill for scaffolding new plugins ([868cab4](https://github.com/elct9620/claudekit/commit/868cab42db90ac8458b65a39e129b28404ee8cc5))
* **dependabot:** improve merge command with user confirmations ([65dcb3c](https://github.com/elct9620/claudekit/commit/65dcb3c1d032ef31bc4eb6190b567cb71af1af46))

## [0.2.0](https://github.com/elct9620/claudekit/compare/claudekit-v0.1.1...claudekit-v0.2.0) (2025-10-18)


### Features

* add automatic plugin rebuild for release-please PRs ([c118b98](https://github.com/elct9620/claudekit/commit/c118b983003d145d30ee72fe322d7507d561432b))
* **dependabot:** add dependabot configuration for npm and github-actions ([9b033b6](https://github.com/elct9620/claudekit/commit/9b033b69dbb0ad406a23003cb6e42cb1937784cd))
* **dependabot:** add setup command for dependabot.yml configuration ([9c76fe8](https://github.com/elct9620/claudekit/commit/9c76fe8fbea635e151763bb95fc8271aebf44f5d))


### Bug Fixes

* properly parse PR JSON in rebuild-plugins workflow ([73f728f](https://github.com/elct9620/claudekit/commit/73f728f8df50405d83fb50dfdac7fcd0a1e4b6b8))

## [0.1.1](https://github.com/elct9620/claudekit/compare/claudekit-v0.1.0...claudekit-v0.1.1) (2025-10-17)


### Features

* add git plugin with ignore command ([2d1638b](https://github.com/elct9620/claudekit/commit/2d1638be2b0a635da58a99332ac7265083f08fd8))
* add license plugin with setup command ([62051e6](https://github.com/elct9620/claudekit/commit/62051e6783cc35adb03c9cddcded41ae0b969436))
* add Release Please for automated version management ([8249e96](https://github.com/elct9620/claudekit/commit/8249e968c16d24b901d2cd2cb3b8c11fbc10902f))
* **config:** add local config support with deep merge ([f5052cc](https://github.com/elct9620/claudekit/commit/f5052ccb8e3b7f7cd7c649b29cf67089546ab578))
* **config:** add shared config package and update workspace ([51e8d1a](https://github.com/elct9620/claudekit/commit/51e8d1acb1877225ad788e43afbc25ddd2f4807c))
* **config:** implement config loader and commit threshold types ([9a35ded](https://github.com/elct9620/claudekit/commit/9a35dede45d7773edb8762457a2e5587ccdb8253))
* **dependabot:** enhance merge workflow with mergeability checks ([480c2e6](https://github.com/elct9620/claudekit/commit/480c2e601a8c71ab40ee67e4d514fcd7712eb21b))
* **git:** add Claude Code hooks for automated git operations ([76ce75a](https://github.com/elct9620/claudekit/commit/76ce75a0bf2476b51dcff0f80f664691954b74d5))
* **git:** implement commit threshold enforcement with git status checks ([1304b32](https://github.com/elct9620/claudekit/commit/1304b32f447ea06c8c230538f1646c82864fc529))
* **hook:** add hook package and integrate with git commit plugin ([8c0d0b3](https://github.com/elct9620/claudekit/commit/8c0d0b332338691082fa524a57f2daa7543c3707))
* **rubric:** add /rubric:create command with code analysis agent ([e952ad2](https://github.com/elct9620/claudekit/commit/e952ad22c99b0d3e8842990ca4be0d024def1104))
* **rubric:** add configuration command ([6ad450d](https://github.com/elct9620/claudekit/commit/6ad450d1e1a95bea52ad127a8133f93c675d2df0))
* **rubric:** add LS tool to config command allowed-tools ([e4b5392](https://github.com/elct9620/claudekit/commit/e4b539274b908d58a427f1afd166d7cc20550a13))
* **rubric:** add plugin scaffolding for self-review system ([255de4c](https://github.com/elct9620/claudekit/commit/255de4c719e7552664fb32abec2bf203c33b189b))
* **rubric:** implement PostToolUse hook for code review enforcement ([381f6af](https://github.com/elct9620/claudekit/commit/381f6af5d6c7e142cf40caffed42624ae3574751))


### Bug Fixes

* **config:** improve error handling for config file parsing ([6958c6b](https://github.com/elct9620/claudekit/commit/6958c6ba800ea0f6c2603365be5f027dfbad48fd))
