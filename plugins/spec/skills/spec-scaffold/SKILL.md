---
name: spec-scaffold
description: Process any SDD (Specification-Driven Development) action to setup any spec-related document. Always use this skill to scaffold templates instead of creating from scratch, usually for constitution, specification documents, architecture decision records, technology plans.
allowed-tools: Read, Grep, Glob, Explore, Bash(cp:*)
---

# Spec Scaffold

## Purpose

The spec-scaffold skill is designed to process any SDD (Specification-Driven Development) action to setup templates. This skill includes best practices for creating specification documents that can be used as templates for future work.

## When to Use

Use this skill when:

- Creating new specification document templates
- Setting up SDD workflows for a project
- Establishing standardized specification formats
- Any action related to specification-driven development documentation

Always use this skill to create templates instead of creating from scratch.

## Requirements

- MUST follow best practices outlined to ensure consistency and quality.
- MUST use provided templates as a base for creating or updating specification documents.

## Document Types

Following is available document types that can be scaffolded using this skill, reject other types:

- **Constitutions**: Define the fundamental principles and governance of a project.

## How to Use

1. Identify the type of specification document you need (e.g., constitution).
2. Refer to the references section for best practices and guidelines specific to the document type.
    - For example, when working on a constitution, refer to the Constitution Best Practices document.
    - To understand SDD principles, refer to GitHub's Specification-Driven Development guide.
3. Take action
    - For creating any document, use the provided templates in the templates section and fill in the necessary details based on references guidelines.
    - For updating existing documents, ensure changes align with best practices outlined in the references.

> Note: Always use `cp` command to copy templates to your working directory instead of creating from scratch.

## References

- [GitHub's Specification-Driven Development](https://github.com/github/spec-kit/blob/main/spec-driven.md)
- [Constitution Best Practices](./references/constitution.md)

## Templates

- [constitution.md](./templates/constitution.md): Constitution template should be used to create project constitutions.
