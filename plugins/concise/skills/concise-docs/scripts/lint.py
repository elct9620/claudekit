#!/usr/bin/env python3
"""Check Markdown documents against the concise-docs rules.

Every heading (including H1) plus the content directly under it, up to the next
heading, is one section. A section with no direct content is a grouping heading
and is skipped. Units are CJK characters plus Latin words; inline code counts
as one word. Errors fail the check:

  - a section without a visual (fenced block, table, or a numbered list of 3+
    items; list items still count as prose)
  - section prose over the cap: 100 units Chinese-dominant, 150 English-dominant
    (code blocks, tables, headings, HTML comments and URLs are not counted)
  - CJK characters inside an ASCII diagram (untagged or text fence), which are
    double-width and break alignment
  - a table wider than 4 columns, or a table cell over 15 units

Warnings are soft limits and fail only with --strict:

  - headings that read as questions or exceed 2-3 words
  - a section with a visual but no prose (say why the visual matters)
  - bold (** or __) over 5% of the document's prose; bold in tables is exempt
  - a sentence over 50 units Chinese-dominant, 25 English-dominant; sentences
    end at 。！？ or .!? and never span paragraphs or list items

A file opts out with the marker `<!-- concise-docs: off -->` outside code
blocks, or is skipped with --exclude GLOB.

Usage:
  lint.py [PATH ...] [--exclude GLOB ...] [--outline] [--strict]
"""

import argparse
import fnmatch
import os
import re
import sys
from dataclasses import dataclass, field

OFF_MARKER = re.compile(r"<!--\s*concise-docs:\s*off\s*-->")
HEADING = re.compile(r"^(#{1,6})\s+(.*?)\s*#*\s*$")
FENCE = re.compile(r"^\s*(`{3,}|~{3,})\s*([\w+-]*)")
DIAGRAM_LANGS = {"", "text", "txt", "ascii", "plain"}
DIAGRAM_STROKE = re.compile(r"[|+]|--|->|<-")
TABLE_ROW = re.compile(r"^\s*\|.*\|\s*$")
TABLE_SEP = re.compile(r"^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$")
LIST_MARKER = re.compile(r"^\s*(?:[-*+]|\d+[.)])\s+")
ORDERED_ITEM = re.compile(r"^\d+[.)]\s+")
STEP_LIST_MIN = 3
CJK = re.compile(r"[㐀-䶿一-鿿豈-﫿぀-ヿ]")
LATIN_WORD = re.compile(r"[A-Za-z0-9]+(?:['’.\-][A-Za-z0-9]+)*")
QUESTION = re.compile(
    r"(為什麼|为什么|如何|怎麼|怎么|怎樣|什麼是|是什麼|嗎|[?？])|^(how|why|what|when|where|which)\b",
    re.IGNORECASE,
)

ZH_MAX = 100
EN_MAX = 150
HEADING_MAX_CJK = 8
HEADING_MAX_WORDS = 3
TABLE_MAX_COLS = 4
CELL_MAX_UNITS = 15
BOLD_MAX_RATIO = 0.05
BOLD = re.compile(r"\*\*(.+?)\*\*|__(.+?)__")
SENTENCE_ZH_MAX = 50
SENTENCE_EN_MAX = 25
SENTENCE_END = re.compile(r"(?<=[。！？])|(?<=[.!?])\s+")


@dataclass
class Section:
    level: int
    title: str
    line: int
    prose: list = field(default_factory=list)
    prose_lines: list = field(default_factory=list)
    has_visual: bool = False
    cjk_diagrams: list = field(default_factory=list)
    table_rows: list = field(default_factory=list)

    @property
    def text(self):
        return "\n".join(self.prose)

    def units(self):
        return count_units(self.text)

    def is_empty(self):
        return not self.has_visual and not strip_inline(self.text).strip()

    def sentences(self):
        """Yield (line, sentence); a blank line or list item ends the block."""
        block = []
        for line, text in [*zip(self.prose_lines, self.prose), (None, "")]:
            if text.strip():
                block.append((line, text.strip()))
                continue
            if block:
                for sentence in SENTENCE_END.split(" ".join(t for _, t in block)):
                    if sentence.strip():
                        yield block[0][0], sentence.strip()
            block = []


def count_units(text):
    text = strip_inline(text)
    cjk = len(CJK.findall(text))
    words = len(LATIN_WORD.findall(CJK.sub(" ", text)))
    return cjk + words, "zh" if cjk >= words else "en"


def split_cells(row):
    codes = re.findall(r"`[^`]*`", row)
    row = re.sub(r"`[^`]*`", "\0", row.strip())  # hide pipes inside inline code
    cells = re.split(r"(?<!\\)\|", row)
    if cells and not cells[0].strip():
        cells = cells[1:]
    if cells and not cells[-1].strip():
        cells = cells[:-1]
    restored = []
    for c in cells:
        while "\0" in c:
            c = c.replace("\0", codes.pop(0), 1)
        restored.append(c.strip())
    return restored


def strip_inline(text):
    text = re.sub(r"`[^`]*`", " code ", text)  # inline code counts as one word
    text = re.sub(r"<!--.*?-->", " ", text, flags=re.S)
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", text)  # images
    text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", text)  # links -> text
    text = re.sub(r"https?://\S+", " ", text)
    text = re.sub(r"<[^>]+>", " ", text)
    return text


def parse(lines):
    sections = []
    current = Section(0, "(preamble)", 1)
    off = False
    fence = None
    block = []
    steps = 0  # consecutive top-level numbered items
    in_front_matter = bool(lines) and lines[0].strip() == "---"
    for i, raw in enumerate(lines, start=1):
        line = raw.rstrip("\n")
        if in_front_matter:
            if i > 1 and line.strip() in ("---", "..."):
                in_front_matter = False
            continue
        if fence:
            if line.strip().startswith(fence):
                body = "\n".join(block[1:])
                if block[0] in DIAGRAM_LANGS and CJK.search(body) and DIAGRAM_STROKE.search(body):
                    current.cjk_diagrams.append(fence_line)
                fence = None
            else:
                block.append(line)
            continue
        m = FENCE.match(line)
        if m:
            fence = m.group(1)[0] * 3
            fence_line = i
            block = [m.group(2).lower()]
            current.has_visual = True
            continue
        if OFF_MARKER.search(line):
            off = True
        m = HEADING.match(line)
        if m:
            sections.append(current)
            current = Section(len(m.group(1)), m.group(2), i)
            steps = 0
            continue
        if TABLE_ROW.match(line):
            if TABLE_SEP.match(line):
                current.has_visual = True
                if current.table_rows:
                    current.table_rows[-1][2] = True  # the row above is the header
            else:
                current.table_rows.append([i, split_cells(line), False])
            continue
        if ORDERED_ITEM.match(line):
            steps += 1
            if steps >= STEP_LIST_MIN:
                current.has_visual = True
        elif line.strip() and not line[0].isspace():
            steps = 0  # blank lines and indented continuations keep the list
        if LIST_MARKER.match(line):
            current.prose.append("")  # a list item never joins the line above
            current.prose_lines.append(i)
        current.prose.append(LIST_MARKER.sub("", line))
        current.prose_lines.append(i)
    sections.append(current)
    return sections, off


def check_heading(section):
    title = strip_inline(section.title)
    issues = []
    if QUESTION.search(title):
        issues.append("heading reads as a question/process; use a definite noun phrase")
    cjk = len(CJK.findall(title))
    words = len(LATIN_WORD.findall(CJK.sub(" ", title)))
    if cjk > HEADING_MAX_CJK or words > HEADING_MAX_WORDS:
        issues.append(
            f"heading too long ({cjk} CJK chars, {words} words); aim for 2-3 words"
        )
    return issues


def check_file(path, strict):
    with open(path, encoding="utf-8") as f:
        lines = f.readlines()
    sections, off = parse(lines)
    if off:
        return None, [], []
    errors, warnings, rows = [], [], []
    for s in sections:
        for line, cells, is_header in s.table_rows:
            if is_header and len(cells) > TABLE_MAX_COLS:
                errors.append(
                    f"{path}:{line}: error: table has {len(cells)} columns, over the {TABLE_MAX_COLS} cap"
                )
            for cell in cells:
                units, _ = count_units(cell)
                if units > CELL_MAX_UNITS:
                    errors.append(
                        f"{path}:{line}: error: table cell has {units} units, over the {CELL_MAX_UNITS} cap: {cell!r}"
                    )
        if s.level == 0 and s.is_empty():
            continue
        if s.level > 0:
            for msg in check_heading(s):
                warnings.append(f"{path}:{s.line}: warning: {msg}: {s.title!r}")
        if s.is_empty():
            rows.append((s, None, None, "group"))
            continue
        units, lang = s.units()
        cap = ZH_MAX if lang == "zh" else EN_MAX
        status = []
        if not s.has_visual:
            status.append("no-visual")
            errors.append(
                f"{path}:{s.line}: error: section has no diagram, table, code block or 3+ step list: {s.title!r}"
            )
        if units > cap:
            status.append("over")
            errors.append(
                f"{path}:{s.line}: error: {units} {lang} units, over the {cap} cap (split into sub-sections): {s.title!r}"
            )
        if units == 0:
            status.append("no-prose")
            warnings.append(
                f"{path}:{s.line}: warning: section has no prose; add a sentence on why the visual matters: {s.title!r}"
            )
        sentence_cap = SENTENCE_ZH_MAX if lang == "zh" else SENTENCE_EN_MAX
        for line, sentence in s.sentences():
            n, _ = count_units(sentence)
            if n > sentence_cap:
                warnings.append(
                    f"{path}:{line}: warning: sentence has {n} {lang} units, over the {sentence_cap} cap: {sentence[:30]!r}"
                )
        for line in s.cjk_diagrams:
            status.append("cjk-diagram")
            errors.append(
                f"{path}:{line}: error: ASCII diagram contains CJK characters; use English labels to keep alignment"
            )
        rows.append((s, units, lang, ",".join(status) or "ok"))
    prose = "\n".join(s.text for s in sections)
    total, _ = count_units(prose)
    bold = sum(count_units(a or b)[0] for a, b in BOLD.findall(prose))
    if total and bold / total > BOLD_MAX_RATIO:
        warnings.append(
            f"{path}:1: warning: bold is {bold / total:.0%} of prose ({bold}/{total} units), over {BOLD_MAX_RATIO:.0%}"
        )
    if strict:
        errors.extend(w.replace(": warning:", ": error:") for w in warnings)
        warnings = []
    return rows, errors, warnings


def collect(paths, excludes):
    files = []
    for p in paths:
        if os.path.isfile(p):
            files.append(p)
            continue
        for root, dirs, names in os.walk(p):
            dirs[:] = sorted(
                d for d in dirs if not d.startswith(".") and d != "node_modules"
            )
            files.extend(
                os.path.join(root, n) for n in sorted(names) if n.endswith(".md")
            )
    def excluded(f):
        rel = os.path.normpath(f)
        return any(
            fnmatch.fnmatch(rel, g) or fnmatch.fnmatch(os.path.basename(rel), g)
            for g in excludes
        )
    return [f for f in files if not excluded(f)]


def print_outline(path, rows):
    print(f"\n{path}")
    for s, units, lang, status in rows:
        indent = "  " * max(s.level - 1, 0)
        visual = "V" if s.has_visual else "-"
        count = "" if units is None else f"{units:>4} {lang}"
        print(f"  {s.line:>4}  {count:>7}  {visual}  {status:<14} {indent}{s.title}")


def main():
    ap = argparse.ArgumentParser(description=(__doc__ or "").split("\n\n")[0])
    ap.add_argument("paths", nargs="*", default=["."])
    ap.add_argument("--exclude", action="append", default=[], metavar="GLOB")
    ap.add_argument("--outline", action="store_true", help="print section outline")
    ap.add_argument("--strict", action="store_true", help="treat warnings as errors")
    args = ap.parse_args()

    all_errors = 0
    for path in collect(args.paths, args.exclude):
        rows, errors, warnings = check_file(path, args.strict)
        if rows is None:
            continue
        if args.outline:
            print_outline(path, rows)
        for msg in errors + warnings:
            print(msg, file=sys.stderr)
        all_errors += len(errors)
    if all_errors:
        print(f"\n{all_errors} error(s)", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
