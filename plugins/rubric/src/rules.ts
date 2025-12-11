import * as fs from "node:fs";
import * as path from "node:path";
import { createRule, type Rule } from "./core.js";

const RULES_DIR = ".claude/rules";

/**
 * Parse YAML frontmatter to extract paths field
 */
function parseFrontmatter(content: string): string[] | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match?.[1]) return null;

  const frontmatter = match[1];
  const pathsMatch = frontmatter.match(/^paths:\s*(.+)$/m);
  if (!pathsMatch?.[1]) return null;

  const pathsValue = pathsMatch[1].trim();
  return pathsValue.split(/,\s*/).map((p) => p.trim());
}

/**
 * Convert glob pattern to RegExp
 */
export function globToRegex(glob: string): RegExp {
  let regex = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  regex = regex.replace(/\*\*/g, "\0");
  regex = regex.replace(/\*/g, "[^/]*");
  regex = regex.replace(/\0/g, ".*");
  return new RegExp(`^${regex}$`);
}

/**
 * Discover rules from .claude/rules/ directory
 */
export function discoverRules(): Rule[] {
  if (!fs.existsSync(RULES_DIR)) return [];

  const rules: Rule[] = [];

  function scanDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        const content = fs.readFileSync(fullPath, "utf-8");
        const patterns = parseFrontmatter(content);
        const name = path.basename(fullPath, ".md");

        if (patterns === null) {
          // No paths = apply to all files
          rules.push(createRule(name, /.*/, fullPath));
        } else {
          // Create rule for each pattern
          for (const pattern of patterns) {
            rules.push(createRule(name, globToRegex(pattern), fullPath));
          }
        }
      }
    }
  }

  scanDir(RULES_DIR);
  return rules;
}
