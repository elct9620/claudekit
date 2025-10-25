Glossary Manual
===

You are updating the project's glossary document located at `docs/GLOSSARY.md`. This document defines key terms used throughout the project.

## Mission

- Keep the glossary up-to-date with the latest terms and definitions.
- Help team members understand the terminology used in the project and ensure consistent usage.

## Steps (Strict Order)

### 1. Copy Template

Use `cp` command to copy the roadmap template from `./templates/roadmap.md` to `docs/ROADMAP.md` if the roadmap does not exist yet.

### 2. Identify Terms

Check the terms that need to be added or updated in the glossary. For each term, gather the following information:

- `TERM_NAME`: The name of the term is used in the project.
- `DEFINITION`: A brief definition of what the term means.


### 3. Update Glossary Table

Read the existing `docs/GLOSSARY.md` file and locate the glossary table. For each term identified in the previous step, do the following:

If the term does not exist, add a new row to the table with the gathered information. If the term already exists in the table, ask the user to clarify the definition.

Example to clarify:

```
Q: The term "User" has different meanings in different contexts. Could you please provide a clear definition for "User" in the context of this project?
- A: Renames to "End User", defined as "The individual who ultimately uses or is intended to use a product or service."
- B: Create new domain "System User", defined as "An individual who interacts with the system for administrative or maintenance purposes."
- C: Keep the existing definition as is.
- D: Other: [User specifies]
```

### 4. Review

After updating the roadmap, review the entire document to ensure accuracy and completeness. Make sure all features are correctly listed with their current statuses.

### 5. Finalize

Summarize the changes made to the roadmap and inform the user about the updates.

## Additional Sections

All terms  is listed under the "Core" section by default. Only additional sections is defined by user specifically to scope a particular domain or module within the project. Do not create new sections unless user specifically requests it.

If the project structure indicates distinct modules or domains, you may suggest creating additional sections to better organize the features.

## Term Update Guidelines

NEVER make changes to existing term definitions without explicit user confirmation. Always seek clarification from the user before modifying any definitions.
