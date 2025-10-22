---
name: spec-scaffold
description: Process any SDD (Specification-Driven Development) action to setup any spec-related document. Always use this skill to scaffold templates instead of creating from scratch, usually for constitution, specification documents, architecture decision records, technology plans.
allowed-tools: Read, Grep, Glob, Explore, Bash(cp:*), TodoWrite
---

# Spec Scaffold

## Instructions

1. Identify the type of specification document is working on (e.g., constitution, architecture decision record).
2. Read the manual and templates provided for the specific document type before proceeding.
3. Making a plan to gather necessary information from the user or existing documentation to fill out the template.
    - Use TodoWrite to outline the steps needed to complete the document.
4. Take one of following actions to create/update the document:
    - No existing document: Use `cp [template_path] [destination_path]` to copy the template to the desired location.
    - Existing document needs updates: Read the existing document, identify sections that need modification, and update them accordingly.
5. According to the plan and manual, gather required information using AskUserQuestion tool if necessary.

## Manual

- [Constitution](./references/constitution.md): How to write a project constitution.

## Templates

- [constitution.md](./templates/constitution.md): Constitution template should be used to create project constitutions.

## References

- [GitHub's Specification-Driven Development](https://github.com/github/spec-kit/blob/main/spec-driven.md)
