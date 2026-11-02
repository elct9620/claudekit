#!/usr/bin/env python3
"""Check text diagrams against the concise-diagram rules.

A Markdown file is checked through its fenced diagrams (untagged or text
fences that contain strokes); any other file is one diagram. Errors:

  - a character wider than one column: anything outside ASCII by default;
    CJK and full-width characters with --unicode, which allows box drawing
  - a box whose borders do not line up: the right border must follow the left
    one down every row, and both must end on a corner in the same row

A file tree (lines branching with `├──`, `└──`, `|--` or `` `-- ``) is a code
listing, not a diagram, and is skipped.

Warnings:

  - a label longer than three words; labels are the text between strokes or
    gaps of two or more spaces

Usage:
  lint.py [--unicode] PATH ...
"""

import argparse
import re
import sys
import unicodedata

FENCE = re.compile(r"^\s*(`{3,}|~{3,})\s*([\w+-]*)")
DIAGRAM_LANGS = {"", "text", "txt", "ascii", "plain"}
STROKE = re.compile(r"-{2,}|[|+<>^]|[─-╿▲-◁▼]")
LABEL_GAP = re.compile(r"-{2,}|[|+<>^]|[─-╿▲-◁▼]|\s{2,}")
TREE_BRANCH = re.compile(r"^[\s│|]*(├──|└──|\|--|`--)")
WORD = re.compile(r"[A-Za-z0-9]+(?:['.\-][A-Za-z0-9]+)*")
LABEL_MAX_WORDS = 3

# Box parts: a top or bottom edge runs from a start corner to an end corner;
# the borders between them are vertical lines or side junctions.
ASCII_BOX = {"start": "+", "end": "+", "horizontal": "-", "vertical": "|", "side": "+"}
UNICODE_BOX = {
    "start": "┌└├┬┴┼╭╰",
    "end": "┐┘┤┬┴┼╮╯",
    "horizontal": "─┄┈━",
    "vertical": "│┆┊┃",
    "side": "├┤┼",
}


def wide(char, unicode):
    if not unicode:
        return ord(char) > 127
    return unicodedata.east_asian_width(char) in ("W", "F")


def diagrams(path, lines):
    """Yield (first line number, rows) for each diagram in the file."""
    if not path.endswith(".md"):
        yield 1, [l.rstrip("\n") for l in lines]
        return
    fence, lang, start, rows = None, "", 0, []
    for i, raw in enumerate(lines, start=1):
        line = raw.rstrip("\n")
        if fence:
            if line.strip().startswith(fence):
                if lang in DIAGRAM_LANGS and any(STROKE.search(r) for r in rows) and not is_tree(rows):
                    yield start, rows
                fence = None
            else:
                rows.append(line)
            continue
        m = FENCE.match(line)
        if m:
            fence, lang, start, rows = m.group(1)[0] * 3, m.group(2).lower(), i + 1, []


def is_tree(rows):
    """A file tree branches from the left and has no box corners."""
    return any(TREE_BRANCH.match(r) for r in rows) and not any(c in "┌┐┘╭╮╯" for r in rows for c in r)


def at(rows, r, c):
    return rows[r][c] if 0 <= r < len(rows) and 0 <= c < len(rows[r]) else " "


def edges(row, box):
    """Yield (left, right) columns of each horizontal box edge in a row."""
    for left, char in enumerate(row):
        if char not in box["start"] or at([row], 0, left + 1) not in box["horizontal"]:
            continue
        for right in range(left + 1, len(row)):
            if row[right] in box["end"]:
                if row[right - 1] in box["horizontal"]:
                    yield left, right
                break
            if row[right] in box["vertical"]:
                break


def closes(row, left, right, box):
    """A bottom edge runs from corner to corner; junctions may branch off it."""
    joints = box["start"] + box["end"]
    return (
        at([row], 0, left) in joints
        and at([row], 0, right) in joints
        and all(c in box["horizontal"] + joints for c in row[left + 1:right])
    )


def is_bottom(rows, top, left, right, box):
    """A bottom edge may branch a connector downward; it opens no new box."""
    border = box["vertical"] + box["side"]
    line = box["horizontal"] + box["start"] + box["end"]
    row = rows[top]
    while left > 0 and row[left - 1] in line:  # widen to the whole edge
        left -= 1
    while right + 1 < len(row) and row[right + 1] in line:
        right += 1
    if box is UNICODE_BOX:
        return row[left] in "└╰" or row[right] in "┘╯"
    return at(rows, top - 1, right) in border and at(rows, top + 1, right) not in border


def check_boxes(rows, box):
    """Yield (row, message) for each box whose borders do not line up."""
    border = box["vertical"] + box["side"]
    for top, row in enumerate(rows):
        for left, right in edges(row, box):
            if at(rows, top + 1, left) not in box["vertical"] or is_bottom(rows, top, left, right, box):
                continue  # a bottom edge, or a line that only looks like one
            for r in range(top + 1, len(rows) + 1):
                if r < len(rows) and closes(rows[r], left, right, box):
                    break  # the bottom edge closes the box
                if at(rows, r, left) not in border:
                    yield r, f"box from column {left + 1} to {right + 1} has no bottom edge"
                    break
                if at(rows, r, right) not in border:
                    yield r, f"right border should be at column {right + 1}"
                    break


def check(path, unicode):
    with open(path, encoding="utf-8") as f:
        lines = f.readlines()
    errors, warnings = [], []
    box = UNICODE_BOX if unicode else ASCII_BOX
    for start, rows in diagrams(path, lines):
        for r, row in enumerate(rows):
            bad = sorted({c for c in row if wide(c, unicode)})
            if bad:
                errors.append(f"{path}:{start + r}: error: characters not one column wide: {''.join(bad)}")
            for label in LABEL_GAP.split(row):
                words = WORD.findall(label)
                if len(words) > LABEL_MAX_WORDS:
                    warnings.append(
                        f"{path}:{start + r}: warning: label has {len(words)} words, over {LABEL_MAX_WORDS}; move detail into a note: {label.strip()!r}"
                    )
        for r, msg in check_boxes(rows, box):
            errors.append(f"{path}:{start + r}: error: {msg}")
    return errors, warnings


def main():
    ap = argparse.ArgumentParser(description=(__doc__ or "").split("\n\n")[0])
    ap.add_argument("paths", nargs="+")
    ap.add_argument("--unicode", action="store_true", help="allow box drawing for terminal output")
    args = ap.parse_args()
    total = 0
    for path in args.paths:
        errors, warnings = check(path, args.unicode)
        for msg in errors + warnings:
            print(msg, file=sys.stderr)
        total += len(errors)
    if total:
        print(f"\n{total} error(s)", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
