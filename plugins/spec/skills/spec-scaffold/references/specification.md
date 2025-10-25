Specification Manual
===

You are updating a specification document in `docs/features/`. This is a TEMPLATE containing placeholders in square brackets (e.g. `[FEATURE_NAME]`, `[BRIEF_TITLE]`, etc.)

## Mission

- Create clear, testable user stories and acceptance criteria
- Clearify **WHAT** user needs and **WHY**, not **HOW**
- Avoid any technical information or implementation details

## Directory Structure

The specification documents have two modes:

- Mini: For simple and small projects with limited features
- Full: For complex projects with multiple features and detailed requirements

Dependent on the project's status, use different directory structures:

```
|- docs/
    |- features/
        |- [feature_name]/          # Full specification mode
            |- specification.md
        |- [feature_name].spec.md        # Mini specification mode
```

## Steps (Strict Order)

### 1. Copy Template

Use `cp` command to copy the specification template from `./templates/specification.md` to the appropriate location based on the chosen mode (mini or full).

### 2. Decide Feature Name

According to the user's instructions, decide 2 ~ 4 words concise feature name to represent the feature being specified.

- "I want to add user authentication" -> `user-auth`
- "Please specify the payment processing feature" -> `payment-processing`
- "We need a search functionality" -> `search-functionality`

**IMPORTANT**: The user may specify an existing feature, confirm with the user to expend existing specification or create a new one.

### 3. Read Existing Specification Template

Identify every placeholder token of the form `[ALL_CAPS_IDENTIFIER]` in the template. List unclarified items to user as questions for clarification.

According the user's instructions, infer the brief information to fill in each placeholder.

Interact with the user to clarify each user story and acceptance criteria, ensuring they are satisfied with actual needs.

- `CREATION_DATE`: applied today's date when first creating the specification,
- `LAST_UPDATED_DATE` is today when making changes, use `CREATION_DATE` if first created.
- `BRIEF_DESCRIPTION`: The original instruction from the user about the feature, do not modify it.

Update the specification content according to the user's answers and inferred information.

### 4. Gather Required Information

Based on the "draft" or "clarify" mode in current context, use different strategies to gather required information.

- Draft Mode: Suggest user stories and confirm with the user.
- Clarify Mode: Ask user to clarify each user story explicitly.

Example draft questions:

```
Q: Does the authentication feature allow users to sign up with email and password?
- A: Yes.
- B: No, only social logins.
- C: No, only email/password.
- D: Other: [User specifies]
```

Example clarify questions:

```
Q: As end user, what is password validation rules when signing up?
- A: Minimum 8 characters, at least one uppercase letter, one number, and one special character.
- B: Minimum 6 characters, no other restrictions.
- C: Other: [User specifies]
```

Gather information one by one until user explicitly answer "STOP". Keep asking until no unclarified items remain or out of context.

### 5. Draft Specification Content

Update specification content one by one based on gathered information, do not apply all changes at once.

- Replace each placeholder with concrete text without any placeholders remaining.
- Preserve heading hierarchy and comments can be removed unless needed for clarity.
- Ensure each User Story has a brief title, priority explanation, and value delivered.
- Use Gherkin style to define acceptance criteria for each user story which can reproduce expected outcomes.

**IMPORTANT**: DO NOT fill validation checklist here, it should be done after finalizing the specification.

### 6. Review

- Ensure no placeholders remain without any reasonable explanation.
- Dates ISO format (YYYY-MM-DD).
- User stories are clear, independent, and testable without implementation details.
- `LAST_UPDATED_DATE` is correct.

### 6. Finalize

Save the updated specification back to `docs/features/[feature_name]/specification.md` (full mode) or `docs/features/[feature_name].spec.md` (mini mode).

> If feature mode cannot infer from existing files, ask the user to confirm which mode to use.

### 7. Quality Validation

Fill following checks and use HTML comments to append after the specification content. Replace existing comment if any.

```
<!--
  Specification Quality Validation
  ===

  **Checked On:** [CHECK_DATE]

  ## Content Quality

  - [ ] No implementation details present (e.g., code snippets, technical jargon, framework, storage, etc.)
  - [ ] Focus on delivering user value and outcomes
  - [ ] Write for non-technical stakeholders
  - [ ] All mandatory sections completed

  ## Readability and Clarity

  - [ ] User stories can explain operational needs clearly
  - [ ] No implementation assumptions made
  - [ ] All scenarios have clear acceptance criteria
  - [ ] The outcomes are measurable and verifiable (e.g., count, response time, performance indicators, etc.)

  ## Notes

  - Items marked unchecked require revision.
-->
```

### 8. Validate Quality

Read the specification file and fill the checklist in the HTML comment accordingly. Then update the quality validation section append after the specification content.

- If all checks are passed, mark all checkboxes as done.
- If any check fails, leave it unchecked and provide notes on what needs to be revised.

Ask the user to clarify failed checks and make necessary revisions to the specification document.

### 9. Update Roadmap and Glossary

- The roadmap located at `docs/ROADMAP.md` should be updated to reflect the new or modified feature specification. Read roadmap manual for detailed steps.
- The glossary located at `docs/GLOSSARY.md` should be updated if any new terms are introduced in the specification. Read glossary manual for detailed steps.

### 10. Summarize Changes

- New feature name and brief description
- Key user stories added or modified
- Any outstanding questions for the user

## Formatting Guidelines

- Use Markdown syntax for headings, lists, and code blocks. (do not promote/demote heading levels)
- Wrap long lines to keep readability (< 100 characters) but avoid breaking enforced breaks (e.g., lists, code blocks).
- Keep single blank line between sections for clarity.
- Use Gherkin syntax for acceptance criteria.

## Modification Rules

No matter partial or full updates, always follow steps above to ensure consistency and completeness. Ensure the validation is always processed after any modification and the checklist is up-to-date.
