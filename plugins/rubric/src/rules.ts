import * as fs from "node:fs";
import * as path from "node:path";
import { createRule, type Rule } from "./core.js";

const RULES_DIR = ".claude/rules";

type Frontmatter = {
  name: string | null;
  paths: string[] | null;
};

/**
 * Parse YAML frontmatter to extract name and paths fields
 */
function parseFrontmatter(content: string): Frontmatter {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match?.[1]) return { name: null, paths: null };

  const frontmatter = match[1];

  const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
  const name = nameMatch?.[1]?.trim() ?? null;

  const pathsMatch = frontmatter.match(/^paths:\s*(.+)$/m);
  const paths = pathsMatch?.[1]
    ? pathsMatch[1]
        .trim()
        .split(/,\s*/)
        .map((p) => p.trim())
    : null;

  return { name, paths };
}

/**
 * Convert glob pattern to RegExp
 *
 * Supports glob patterns: * (any chars except /), ** (zero+ dirs), {a,b} (alternation)
 */
export function globToRegex(glob: string): RegExp {
  const braceExpansions: string[] = [];
  let regex = glob.replace(/\{([^}]+)\}/g, (_, contents) => {
    const options = contents.split(",").map((s: string) => s.trim());
    braceExpansions.push(options.join("|"));
    return `\x01${braceExpansions.length - 1}\x02`;
  });

  regex = regex.replace(/[.+^${}()|[\]\\]/g, "\\$&");

  regex = regex.replace(/\x01(\d+)\x02/g, (_, index) => {
    return `(${braceExpansions[Number.parseInt(index)]})`;
  });

  regex = regex.replace(/\*\*\//g, "\x00");
  regex = regex.replace(/\*/g, "[^/]*");
  regex = regex.replace(/\x00/g, "(.*\\/)?");

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
        const frontmatter = parseFrontmatter(content);
        const name = frontmatter.name || path.basename(fullPath, ".md");

        if (frontmatter.paths === null) {
          // No paths = apply to all files
          rules.push(createRule(name, /.*/, fullPath));
        } else {
          // Create rule for each pattern
          for (const pattern of frontmatter.paths) {
            rules.push(createRule(name, globToRegex(pattern), fullPath));
          }
        }
      }
    }
  }

  scanDir(RULES_DIR);
  return rules;
}
