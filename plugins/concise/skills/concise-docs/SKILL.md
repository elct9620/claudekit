---
name: concise-docs
description: Write, rewrite, or review human-facing Markdown documentation so it reads at a glance — short sections each anchored by a diagram, table, or code block, with content ordered by dependency; a bundled script verifies the limits. Use this skill whenever the user asks to write, rewrite, restructure, or review a README, anything under docs/, an architecture or design document, a guide, or any other Markdown meant for people to read — even if they never mention length, format, or style. 撰寫、改寫、整理或審閱任何文件時使用。
---

# Concise Docs

Readers skim: headings first to get the structure, then visuals to get the gist, and prose last to fill in details. These rules turn every section into a unit that can be read at a glance — a format already proven to make documents both quick to read and clear.

## Section Rules

A section is any heading (including H1) plus the content directly under it, up to the next heading.

| Rule | Limit | Why |
|------|-------|-----|
| Visual | At least one ASCII diagram, table, code block, or numbered list of 3+ steps | Structure reads faster as a visual; the visual anchors the section |
| Length | At most 100 Chinese characters; 150 English words | A section that swells breaks the reading rhythm |
| Sentence | At most 50 Chinese characters; 25 English words (soft) | Each extra clause is one more thing to hold in mind |
| Diagram labels | English only inside ASCII diagrams | CJK characters are double-width and break alignment |
| Table | At most 4 columns; at most 15 units per cell | Wide or wordy tables squeeze columns until they stop scanning |
| Emphasis | Bold near 5% of prose (soft); table bold exempt | Emphasis works only when rare; everywhere means nowhere |
| Heading | 2-3 word definite noun phrase (soft) | Headings are the table of contents; each should say what is there |

- Only prose counts. Code, diagrams, tables, headings, and URLs are excluded; list items always count, even when a numbered list is the section's visual. Units are CJK characters plus Latin words, inline code counts as one word, and the dominant language picks the limit.
- The introduction under H1 is limited too — a bloated opening is just as uneven.
- A sentence ends at 。！？ or .!?, and every paragraph or list item ends one too. Split a long sentence where a new point starts: a reason, a condition, or an exception usually reads better on its own.
- A heading with only sub-headings and no direct content is a grouping heading and is not checked.

### Length Cap

When a section exceeds the cap, split it into sub-sections rather than trimming until meaning is lost: find the natural topic boundaries and give each sub-topic its own visual.

There is no minimum. Around 50 characters (or words) is a natural size, but a short section that says everything it has is better than a padded one — never add sentences just to fill space, especially claims the source does not support. A section that feels thin usually belongs merged into a neighbour.

A visual alone is not a section: give it at least one sentence saying why the reader should look at it — what question it answers or when it applies. Without that, a table is just values with no context.

Paragraphs inside a section are fine, but each should carry one idea; two or three sentences per paragraph usually reads best.

### Table Shape

A table cell holds a term, a value, or a short phrase — not a sentence. When a cell needs a full explanation, move it into the prose or into a sub-section, and keep the cell as the short label. More than four columns usually means two tables, or a list per row.

A list whose items read "term: description" is a two-column table; write it as one so each description keeps to a cell.

### Direct Statements

State what the thing is or does, positively and directly. Do not open with the problem and then turn it around into the solution; that makes readers hold the negative in mind before they learn the point.

```
✅ 建立統一的認證系統，取代各產品獨立的認證機制。
❌ 跨產品間有不同認證機制，造成以下問題，因此建立統一機制。
✅ Tokens expire within an hour, so a leaked token stays useful only briefly.
❌ Long-lived keys are dangerous when leaked. To solve this, tokens expire within an hour.
```

The script cannot detect this; check it while writing and again when reviewing.

### Consistent Terms

Give each concept one name and reuse that exact name in prose, headings, tables, and diagrams. Readers take a new word for a new thing, so a synonym makes them stop to check. Define a term at its first use; in Chinese documents, choose the Chinese or the English term and keep it.

```
✅ 權杖 … 權杖 … 權杖撤銷          Token … Token … Token Revocation
❌ 權杖 … token … 憑證（同一件事）  token … access key … credential (one thing)
```

### Step Lists

When the reader must act in order, write a numbered list: one action per step, in the imperative, with any condition before its action. Readers follow steps one at a time, so a step with two actions gets half done, and a trailing condition is read too late. A list of three or more steps is the section's visual on its own; add a code block only for content the steps do not already show.

```
✅ 1. If `.cache/` exists, delete it.
   2. Run `pnpm build`.
❌ 1. Run `pnpm build` after deleting `.cache/` if it exists.
```

### Heading Style

```
✅ 分層設計   認證機制   權杖簽發   Token Lifecycle   Key Rotation
❌ 為什麼要分層？   如何進行認證   Why We Rotate Keys   How to Issue Tokens
```

A heading states *what* the section is, not a question or a process. Questions and "how to…" hide the answer, forcing readers into the body just to learn what the section covers.

## Ordering Principles

The script cannot judge order, so this is where writing needs the most care. Apply three principles in sequence:

```
Dependency       what is depended on comes first   "Token" before "Token Revocation"
Big to small     whole → parts → details           overview → components → one component's flow
Shallow to deep  what → how to use → why → edge cases
```

- Dependency: a reader should never meet a term that has not been introduced. List the concepts, sketch which depends on which, and order them topologically.
- Big to small: give the map before the streets. The first section shows the whole and where each part sits; later sections zoom in.
- Shallow to deep: within a topic, give the minimum needed to use it first, then principles and exceptions, so a reader who only wants to get started can stop anywhere.

When they conflict, dependency wins — a document that skips prerequisites cannot be read, while a less elegant order is merely harder to read.

## Workflow

1. Outline: write only the heading tree, order it by the principles above, and make each heading a 2-3 word noun phrase.
2. Pick visuals: decide a diagram, table, code block, or step list for each section. If none comes to mind, the section's topic is usually not concrete enough and should be re-cut.
3. Write prose: state things directly; prose adds only what the visual cannot show (reasons, constraints, trade-offs); do not restate the visual. Keep ASCII diagram labels in English even in a Chinese document; explain them in the surrounding prose if needed.
4. Check: run the script, fix every error, and use `--outline` to review ordering and section balance. Then reread for what the script cannot see — ordering, problem-then-fix phrasing, and one name per concept.

```bash
python3 ${CLAUDE_SKILL_DIR}/scripts/lint.py docs/ README.md --outline
```

Output is `path:line: error|warning: ...`; the exit code is 1 when any error exists. Warnings (heading style, sections without prose, bold ratio, sentence length) are soft limits that need judgement; `--strict` turns them into errors. Finish with zero errors.

## Excluding Files

Files with a special purpose that does not fit this format (CHANGELOG, legal terms, generated docs) can opt out:

```markdown
<!-- concise-docs: off -->
```

The marker outside code blocks skips the whole file; alternatively pass `--exclude 'CHANGELOG.md'` (repeatable). Exclude only when the file's purpose genuinely differs, not to dodge a section that is hard to split.

## Rewriting Documents

Start with `--outline` to see which sections are too long, too short, or missing visuals; rewrite problem-then-fix passages as direct statements; rebuild the outline by the ordering principles; only then move and rewrite content. Keep every fact from the original — splitting sections makes information easier to read, it is not a licence to drop it.

Write the document in the language the user or the existing document uses; these instructions being in English does not change that.
