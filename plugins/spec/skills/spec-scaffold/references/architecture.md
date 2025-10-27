Architecture Manual
===

You are documenting the architecture and design decisions of a software project. This is a TEMPLATE containing placeholders in square brackets (e.g. `[STACK_NAME]`, `[PATTERN_NAME]`, etc.)

## Mission

- Ensure `ARCHITECTURE.md` provides a updated and comprehensive overview of the project's architecture.
- Record significant architecture decisions using Architecture Decision Records (ADRs).
- Maintain clarity and consistency architecture choices and patterns.

## Directory Structure

The architecture documentation is organized as follows:

```
|- docs/
    |- ADRs/                # Architecture Decision Records
        |- [date]-[decision-title].md # Individual ADR files
    |- ARCHITECTURE.md          # Main architecture document
```

## Steps (Strict Order)

### 1. Prepare Architecture Document

Use `cp` command to copy the architecture template from `./templates/architecture.md` to `docs/ARCHITECTURE.md` if it does not already exist.

### 2. Copy Decision Record Template

Use `cp` command to copy the ADR template from `./templates/adr.md` to `docs/ADRs/[date]-[decision-title].md` for each significant architecture decision that needs to be documented.

**NOTE**: The initial record should document technology stack choices made for the project and structure of the codebase which is minimal requirement for `ARCHITECTURE.md`.

### 3. Read Existing Architecture Document

Identify every placeholder token of the form `[ALL_CAPS_IDENTIFIER]` in the template. Create a series of questions to ask the user for each decision is made.

- `DATE`: Use today's date in `YYYY-MM-DD` format.
- `DECISION_TITLE`: A concise title summarizing the decision (e.g., `use-redis-caching`).

### 4. Gather Required Information

Ask user for each placeholder to clarify the architecture decisions and patterns used in the project. Ask questions one by one and infer next question based on user's answers.

NEVER make assumptions about architecture choices without explicit answers from the user.

Example questions to ask the user:

```
Q: What programming languages are used in the project?
- A: [User's Specified Languages]

Q: Will use any specific frameworks or libraries?
- A: Ruby on Rails # infer from user's answer
- B: Other: [User's Specified Frameworks]

Q: What database systems are utilized?
# ...
```

### 5. Draft Decision Record

Update decision record content one by one according to the user's answers and inferred information.

- Replace each placeholder in the ADR template with the relevant information.
- Preserve the heading hierarchy and formatting of the template.
- Ensure clarity and completeness of each section in the ADR.

### 6. Validate Decision Record

- Ensure no placeholder tokens remain in the ADR.
- Check for consistency and accuracy of the documented decisions.
- Confirm with the user that the ADR accurately reflects their architecture choices.
- `DATE`: Use today's date in `YYYY-MM-DD` format.

### 7. Finalize Decision Record

Save the completed ADR in the `docs/ADRs/` directory with the appropriate filename.

### 8. Synchronize Architecture Document

Update `docs/ARCHITECTURE.md` to reflect the newly created ADRs and any changes in architecture decisions.

- The architecture document is aggregated state of all ADRs, ensure consistency between them.
- The newer ADRs is higher priority than older ones.
- `ARCHITECTURE.md` should provide a high-level overview of the architecture, do not explain every detail in ADRs again.
- Ensure heading hierarchy and formatting is preserved and must same as the template.

### 9. Summarize Changes

- Provide a summary of the changes made to the architecture documentation.
- Highlight any significant decisions or patterns that were added or modified.
- The path of newly created ADR file.

## Constraints

- Create only one ADR per significant architecture decision.
- Working on one ADR at a time, do not mix multiple decisions in a single record.
- Always update `ARCHITECTURE.md` after finalizing each ADR.
- Do not make any decisions without explicit confirmation from the user.

