Constitution Manual
===

You are updating the project constitution at `docs/CONSTITUTION.md`. This is a TEMPLATE contatining placeholders in square brackets (e.g. `[PROJECT_NAME]`, `[PRINCIPLE_1_NAME]`, etc.)

## Mission

- Collect/derive concrete values
- Fill template precisely
- Propagate or amendments across dependent artifacts

## Steps (Strict Order)

### 1. Read Existing Constitution Template

Identity every placeholder token of the form `[ALL_CAPS_IDENTIFIER]` in the template.

**IMPORTANT**: The principles may less or more than defined in the template. Follow the user's instructions to fit the template accordingly.

## 2. Gather Required Information

If user already provided the necessary information, use it directly. Otherwise, infer from existing project documentation (e.g. README, docs, prior constitution versions if embedded)

- `RATIFICATION_DATE` is the original date adopted, if unknown ask or mark as "TODO"
- `LAST_AMENDMENT_DATE` is today when making changes, otherwise keep previous date
- `CONSTITUTION_VERSION` must increment according to semantic versioning rules:
  - MAJOR: Backward-incompatible changes applied to principles or governance
  - MINOR: New principle/section added or guideance expanded without conflicting prior rules
  - PATCH: Clarifications, typos, non-semantics refinements

If version bump is unclear, propose reasoning before finalizing.

## 3. Draft Constitution Content

- Replace each placeholder with concrete text without any placeholders remaining.
- Preserve heading hierarchy and comments can be removed unless needed for clarity.
- Ensure each Principle section: succinctname line, paragraph (or bullet list) capturing non-negotiable rules, explict rationale if obvious.
- Ensure Governance section listed amendment procedure, versioning policy, and compliance expectations.

## 4. Consistency Check

Read any guidance documents (e.g. `README.md`, `CONTRIBUTING.md`, or agent-specific guidance files if exist) and update the references to the principles changed.

### 5. Produce Amendedment Report

Append after the YAML frontmatter as an HTML comment after update.

- Version Changes: `old -> new` (e.g. `2.0.0 -> 2.1.0`)
- Bump Rationale: explain why made the version change
- List of modified principles
- List of added sections
- List of removed sections
- Follow-up TODOS: if any placeholders could not be filled

### 7. Review

- Ensure no placeholders remain without any reasonable explanation.
- Version information is matched amendment report.
- Dates ISO format (YYYY-MM-DD).
- Principles are declarative, testable, and free of vague language (replace "should" with MUST/SHOULD rationale where apparopriate).

### 8. Finalize

Save the updated constitution back to `docs/CONSTITUTION.md` (overwrite existing file).

### 9. Summarize Changes

- New version and rationale
- Any follow-up actions needed

## Formatting Guidelines

- Use Markdown headings exactly as in the template. (do not promote/demote heading levels)
- Wrap long lines to keep readability (< 100 characters) but avoid breaking enforced breaks (e.g., lists, code blocks).
- Keep single blank line between sections for clarity.
- Avoid trailing whitespace.

## Modification Rules

No matter partial or full updates, always follow steps above to ensure consistency and completeness. Never create a new constitution, always operate on the existing `docs/CONSTITUTION.md` file.

## Missing Information

Any critical missing information (e.g. ratification date, principle details) always use `TODO(FIELD_NAME): explanation` format to indicate what is missing and why.
