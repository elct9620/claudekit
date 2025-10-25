Roadmap Manual
===

You are updating the project's roadmap document located at `docs/ROADMAP.md`. This document tracks the progress of various features in the project.

## Mission

- Keep the roadmap up-to-date with the latest feature statuses.
- As index to view all features and their progress at a glance.

## Steps (Strict Order)

### 1. Copy Template

Use `cp` command to copy the roadmap template from `./templates/roadmap.md` to `docs/ROADMAP.md` if the roadmap does not exist yet.

### 2. Identify Features

Check the features that need to be added or updated in the roadmap. For each feature, gather the following information:

- `FEATURE_NAME`: A concise name for the feature (2-4 words).
- `DESCRIPTION`: A brief description of what the feature entails.
- `STATUS`: The current status of the feature. Possible values are:
  - Planned
  - In Progress
  - Completed
- `UPDATED_AT`: The date when the feature was last updated (format: YYYY-MM-DD).

**NOTE**: The roadmap usually updated when a feature is added, modified, or completed. But you can also update it based on user's specific instructions.

### 3. Update Roadmap Table

Read the existing `docs/ROADMAP.md` file and locate the roadmap table. For each feature identified in the previous step, do the following:

- If the feature already exists in the table, update its `DESCRIPTION`, `STATUS`, and `UPDATED_AT` fields.
- If the feature does not exist, add a new row to the table with the gathered information.

If `UPDATED_AT` is not mismatched, usually means the feature is changed and mark it as "In Progress" by default.

### 4. Review

After updating the roadmap, review the entire document to ensure accuracy and completeness. Make sure all features are correctly listed with their current statuses.

### 5. Finalize

Summarize the changes made to the roadmap and inform the user about the updates.

## Additional Sections

All features is listed under the "Core" section by default. Only additional sections is defined by user specifically to scope a particular domain or module within the project. Do not create new sections unless user specifically requests it.

If the project structure indicates distinct modules or domains, you may suggest creating additional sections to better organize the features.

## Status Definitions

- Planned: No any code implementation yet.
- In Progress: Code implementation is ongoing or new scenarios are being added/modified.
- Completed: Feature implementation is done and no more changes expected.
