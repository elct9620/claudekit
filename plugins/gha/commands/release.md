---
description: Set up Release Please configuration for automated versioning and releases
allowed-tools: Read, Write, Edit, LS, Glob, Grep, WebSearch, AskUserQuestion
argument-hint: <options>
---

# Rule

The `<execute>ARGUMENTS</execute>` will execute the main procedure.

# Role

You are a release automation specialist helping to set up Release Please for automated versioning and releases.

# Definition

<function name="detect_monorepo_structure">
    <description>Detect monorepo configuration from workspace files</description>
    <step>1. Search for workspace configuration files in root directory</step>
    <step>2. Extract package patterns from workspace configuration</step>
    <step>3. If no workspace config, check for common monorepo directory patterns</step>
    <return>Monorepo type and package patterns, or null if not monorepo</return>
</function>

<function name="detect_package_type">
    <description>Detect release-type for a package based on its manifest files</description>
    <parameters name="path">Path to the package directory</parameters>
    <step>1. Search for package manifest files in the directory</step>
    <step>2. Map manifest to Release Please release-type based on official documentation</step>
    <step>3. Default to "simple" if no recognized manifest found</step>
    <return>Release type supported by Release Please</return>
</function>

<function name="extract_package_info">
    <description>Extract package name and version from package manifest</description>
    <parameters name="path">Path to the package directory</parameters>
    <parameters name="type">Release type detected</parameters>
    <step>1. Read the package manifest file based on detected type</step>
    <step>2. Extract package name and current version from manifest</step>
    <step>3. If version not found, default to "0.0.0"</step>
    <return>Package name and current version</return>
</function>

<function name="detect_extra_files">
    <description>Detect files that need version synchronization</description>
    <parameters name="path">Path to the package directory</parameters>
    <step>1. Search for files containing version fields not managed by Release Please</step>
    <step>2. Include files that should be updated when version changes</step>
    <return>Array of extra files paths relative to package, or empty array</return>
</function>

<function name="discover_packages">
    <description>Discover all packages in the project</description>
    <step>1. <execute name="detect_monorepo_structure" /></step>
    <step>2. If monorepo, expand patterns to find all package directories</step>
    <step>3. Always include root directory as a potential package</step>
    <loop for="each package directory">
        <step>4. <execute name="detect_package_type">$path</execute></step>
        <step>5. <execute name="extract_package_info">$path, $type</execute></step>
        <step>6. <execute name="detect_extra_files">$path</execute></step>
    </loop>
    <step>7. Filter out directories without valid package files</step>
    <return>Array of package info objects with path, name, version, type, extra_files</return>
</function>

<function name="search_action_version">
    <description>Search for the latest version of release-please-action</description>
    <step>1. Use WebSearch to find "googleapis/release-please-action latest version"</step>
    <step>2. Extract the latest major version tag (e.g., v4)</step>
    <return>Latest version tag for the action</return>
</function>

<function name="generate_config">
    <description>Generate release-please-config.json content</description>
    <parameters name="packages">Array of discovered packages</parameters>
    <parameters name="options">User options (separate-pull-requests, etc.)</parameters>
    <step>1. Create base config with $schema</step>
    <loop for="each package">
        <step>2. Create entry with release-type, package-name, changelog-path, component, extra-files</step>
    </loop>
    <step>3. For root package in monorepo, add exclude-paths for other package directories</step>
    <step>4. Add global options (separate-pull-requests, etc.)</step>
    <return>JSON string of release-please-config.json</return>
</function>

<function name="generate_manifest">
    <description>Generate .release-please-manifest.json content</description>
    <parameters name="packages">Array of discovered packages with versions</parameters>
    <step>1. Create object with package paths as keys</step>
    <step>2. Use "." for root package</step>
    <step>3. Use relative paths for other packages</step>
    <step>4. Set current version for each package</step>
    <return>JSON string of .release-please-manifest.json</return>
</function>

<function name="generate_workflow">
    <description>Generate GitHub Actions workflow for release-please</description>
    <parameters name="version">release-please-action version to use</parameters>
    <step>1. Create workflow with push trigger on main branch</step>
    <step>2. Set permissions for contents: write and pull-requests: write</step>
    <step>3. Add release-please job using googleapis/release-please-action@{version}</step>
    <return>YAML string of workflow file</return>
</function>

<function name="confirm_configuration">
    <description>Display detected configuration and ask for user confirmation</description>
    <parameters name="packages">Array of discovered packages</parameters>
    <parameters name="is_monorepo">Whether project is a monorepo</parameters>
    <step>1. Display summary table of detected packages (Path, Name, Version, Type, Extra Files)</step>
    <step>2. Ask user to confirm or modify the configuration</step>
    <step>3. Ask about separate-pull-requests option (default: true for monorepo, false for single package)</step>
    <return>Confirmed packages and options</return>
</function>

<procedure name="main">
    <description>Main procedure to set up Release Please configuration</description>
    <parameters name="options">User options (optional)</parameters>
    <step>1. Check if release-please-config.json already exists</step>
    <condition if="config exists">
        <step>2. Ask user if they want to overwrite existing configuration</step>
        <return>3. User declined to overwrite</return>
    </condition>
    <step>4. <execute name="discover_packages" /></step>
    <condition if="no packages found">
        <return>5. No packages found in the project</return>
    </condition>
    <step>6. <execute name="confirm_configuration">$packages, $is_monorepo</execute></step>
    <step>7. <execute name="search_action_version" /></step>
    <step>8. <execute name="generate_config">$confirmed_packages, $options</execute></step>
    <step>9. <execute name="generate_manifest">$confirmed_packages</execute></step>
    <step>10. <execute name="generate_workflow">$action_version</execute></step>
    <step>11. Write release-please-config.json, .release-please-manifest.json, .github/workflows/release-please.yml</step>
    <step>12. Display summary of created files and remind to use conventional commits</step>
    <return>Success message with created files</return>
</procedure>

# Task

<execute name="main">$ARGUMENTS</execute>
