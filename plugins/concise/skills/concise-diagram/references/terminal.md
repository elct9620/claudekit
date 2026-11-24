# Text Diagrams

A text diagram aligns only when every character takes exactly one column. Keep labels in English: CJK characters take two columns and push every border after them out of line. Explain labels in the surrounding prose or the notes when the document is in another language.

## Character Sets

| Purpose | Unicode (default) | ASCII (on request) |
|---------|--------------------|------------------|
| Box corners | `┌ ┐ └ ┘` | `+` |
| Lines | `─ │` | `- \|` |
| Junctions | `├ ┤ ┬ ┴ ┼` | `+` |
| Arrows | `▶ ◀ ▲ ▼` | `> < ^ v` |
| Dashed line | `┄ ┆` | `. :` |

Use one set per diagram: Unicode unless the user asks for ASCII.

## Layout

- Pad every line inside a box to the same width before its right border.
- Leave at least one space between a label and a border, and two columns of edge between boxes so an arrow fits.
- Place an edge label above a horizontal edge or beside a vertical one, never across a border.
- Put the diagram in a code fence and the lettered notes after it as a list; a terminal reply renders Markdown as well.

## Examples

Flow, Unicode:

```
┌────────┐  push   ┌────────┐  deploy  ┌────────┐
│ Commit │────────▶│ CI     │─────────▶│ Server │
└────────┘         └────────┘          └────────┘
```

Layers, Unicode:

```
┌───────────────────────────┐
│ Interface                 │
├───────────────────────────┤
│ Application               │
├───────────────────────────┤
│ Domain                    │
└───────────────────────────┘
```

Sequence, ASCII:

```
Client          API            Store
  |   request    |               |
  |------------->|    query      |
  |              |-------------->|
  |              |<--------------|
  |<-------------|    rows       |
  |   response   |               |
```

Containment, Unicode:

```
┌─ Cluster ──────────────────┐
│ ┌──────────┐  ┌──────────┐ │
│ │ Web      │  │ Worker   │ │
│ └──────────┘  └──────────┘ │
└────────────────────────────┘
```

## Checking

```bash
python3 ${CLAUDE_SKILL_DIR}/scripts/lint.py README.md reply.txt  # fenced diagrams, or a terminal reply
python3 ${CLAUDE_SKILL_DIR}/scripts/lint.py --ascii README.md    # ASCII on request
```

The script reports boxes whose borders do not line up, characters wider than one column (anything outside ASCII with `--ascii`), and labels longer than three words.
