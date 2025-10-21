Constitution Best Practice
===

This document outlines best practices to maintain a constitution for a project.

## Location

By the convention the constitution document should named `CONSTITUTION.md` and be located at the `docs/` directory of the project repository.

## Structure

The constitution at a minimum should include the following sections:

- Principles
- Governance

### Principles

The principles section should outline the development principles that the project adheres to. And it will be used to review other specification documents to ensure they align with the project's principles.

### Governance

The governance section should outline the rules and processes for co-working on the project. This may include approval processes, review requirements, compliance checks, etc.

### Other Sections

Depending on the project's needs, additional sections can be applied for other requirements, technical standards, etc.

## Maintenance

The front matter of the constitution should include:

- version: The current version of the constitution.
- ratified: The date when the constitution was first ratified.
- lastAmended: The date when the constitution was last amended.

When making changes to the constitution, ensure to update the version and lastAmended fields accordingly.

### Metadata

Use `<!-- ... -->` comments after the front matter section. This area is designed to introduce recently changes to the constitution for easy reference.

Example:

```markdown
---
version: 2.1.1
ratified: 2025-10-21
lastAmended: 2025-10-21
---
<!---
  CONSTITUTION AMENDMENT LOG
  ===

  Version Changes: 2.1.0 → 2.1.1
  Bump Rationale: Clarified Principle III to emphasize simplicity.

  Modified Sections:
    - Principle III. Simplicity and YAGNI: Updated description to stress starting simple and only implementing necessary features.
    - Principle V. Observability: Added requirement for structured logging.

  Added Sections:
    - Performance Requirements: Introduced new section outlining performance benchmarks for the project.

  Removed Sections: N/A (initial version)

  Follow-up TODOs: None
--->
```

Every amendment to the constitution should be documented in this section for easy reference.
