License Plugin
===

Commands to manage open source licenses in current repository.

## Commands

### `/license:setup`

Setup LICENSE file for the project (defaults to MIT license).

**Features:**
- Downloads official license templates from GitHub's choosealicense.com
- Defaults to MIT license
- Supports various license types (MIT, Apache-2.0, GPL, etc.)
- Automatically cleans up front matter from downloaded templates
- Checks for existing LICENSE file to avoid overwriting

**Usage:**
```
/license:setup
```

Or specify a license type:
```
/license:setup [license_type]
```

**Examples:**
```
/license:setup
/license:setup MIT
/license:setup Apache-2.0
/license:setup GPL-3.0
```

**How it works:**
1. Checks if LICENSE file already exists
2. Uses specified license type or defaults to MIT
3. Downloads license template from [choosealicense.com](https://choosealicense.com)
4. Removes front matter if present
5. Prompts user to update copyright year and holder

**Note:** After setup, remember to update the copyright year and holder information in the LICENSE file.
