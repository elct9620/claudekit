---
name: spec-scaffold
description: Process any SDD (Specification-Driven Development) action to setup templates. This skill should be used when creating specification document templates instead of creating from scratch, as it includes best practices for specification-driven development workflows.
---

# Spec Scaffold

## Purpose

The spec-scaffold skill is designed to process any SDD (Specification-Driven Development) action to setup templates. This skill includes best practices for creating specification documents that can be used as templates for future work.

## When to Use

Use this skill when:
- Creating new specification document templates
- Setting up SDD workflows for a project
- Establishing standardized specification formats
- Users request template creation for requirements, design, or task documents

Always use this skill to create templates instead of creating from scratch.

## How to Use

### Workflow

1. **Consult references**: Read the appropriate reference files in `references/` to understand the detailed actions and procedures for the specific SDD action being performed.

2. **Use templates**: Always copy templates from `templates/` using the `cp` command before performing any action. Never create specification documents from scratch - the templates contain best practices and standardized formats.

### Bundled Resources

#### `references/`
Contains detailed procedural instructions for each type of SDD action. Consult these files to understand the specific steps and best practices for creating different types of specification documents.

#### `templates/`
Contains template files that MUST be used as the starting point for all specification documents. Always use `cp` command to copy the appropriate template before making any modifications or additions.
