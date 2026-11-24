---
name: concise-diagram
description: Draw diagrams that read at a glance — architecture, layers, flows, sequences, containment — as Unicode box-drawing text in a terminal reply or Markdown (ASCII only when asked), or inline SVG in HTML, with one concept per node, short labels, and lettered notes below; bundled scripts check text diagram alignment and fetch Lucide or brand icons. Use this skill whenever you are about to draw any diagram, box-and-arrow sketch, or ASCII art, including the diagrams inside documents written with concise-docs, even if the user only asks to "explain the structure" or "show how it fits together". 畫架構圖、流程圖、分層圖、時序圖或任何示意圖時使用。
---

# Concise Diagram

A diagram shows structure: which parts exist and how they connect. Readers take in the shape first, then the labels, then the notes — so the shape carries the meaning and the words stay short.

## Elements

| Element | Holds | Text |
|---------|-------|------|
| Node | One concept | Label of 1-3 words |
| Edge | One relation between two nodes | Specific verb, 1-3 words |
| Group | Nodes that belong together | Label of 1-3 words |
| Note | Detail a label cannot hold | concise-docs sentence limit |

Structure lives in edges and groups. Take away the boxes: if what remains reads as a list, it is a list or a table — write it as one, since side-by-side columns without edges or groups only look like a diagram.

An edge label says what flows or happens — `queries`, `publishes`, `renders` — because a vague `uses` tells the reader nothing the arrow did not. Give each concept one name in the diagram and the surrounding text; in a CJK document, a text diagram needs English labels, so use the English term in the prose too.

## Notes

When a node or edge needs more than its label, mark it with a letter and explain it in a list below the diagram, outside the drawing — a list, because Markdown joins plain lines into one paragraph. Notes are prose, so write them in the reader's language:

```
┌──────────┐  queries  ┌───────────┐
│ Main (a) │──────────▶│ Store (b) │
└──────────┘           └───────────┘
```

- (a) The main application serving HTTP requests.
- (b) PostgreSQL, one schema per tenant.

The note list is also the diagram's key: explain any notation whose meaning is not obvious, such as a dashed edge.

## Shape

- One main direction, left to right or top to bottom, so the eye follows the flow without searching.
- Crossing edges mean the diagram holds too much; split it. Edges merging into one node are fine. Straight edges with few bends read fastest.
- Order diagrams big to small and shallow to deep, as in concise-docs: the first shows the whole, each later one zooms into a single part and draws it under the same name.

| Form | Shows | Layout |
|------|-------|--------|
| Layers | Dependency between levels | Stacked boxes, top depends on below |
| Flow | Steps or data movement | Boxes and arrows in one direction |
| Sequence | Messages over time | Lifelines across, time downward |
| Containment | What sits inside what | Nested boxes |

## Medium

| Output | Characters | Reference |
|--------|-----------|-----------|
| Terminal reply or Markdown document | Unicode box drawing | `references/terminal.md` |
| HTML page | Inline SVG | `references/html.md` |

Box drawing reads cleaner than ASCII and renders one column wide in current terminals, editors, and GitHub; draw in ASCII `+ - | > v` only when the user asks for it. A text diagram always sits in a code fence, since the terminal renders Markdown too and collapses spacing outside one. A file tree is a listing, not a diagram, and keeps its usual form. Read the reference for the output before drawing.

## Workflow

1. List the nodes, edges, and groups in words before drawing anything; check each is one concept with a 1-3 word label.
2. Pick the form, and split the content into several diagrams if edges would cross.
3. Draw it in the medium's characters, then write the lettered notes below.
4. Check text diagrams with the script and SVG by rendering a screenshot, then fix every error and every label that touches a line or border.

```bash
python3 ${CLAUDE_SKILL_DIR}/scripts/lint.py docs/architecture.md /tmp/diagram.txt  # Markdown or a terminal reply
python3 ${CLAUDE_SKILL_DIR}/scripts/lint.py --ascii docs/architecture.md           # ASCII on request
```

For a terminal reply, write the diagram to a scratch file first and check it there. Output is `path:line: error|warning: ...`; the exit code is 1 when any error exists.
