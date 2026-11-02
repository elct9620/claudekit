# SVG Diagrams

In HTML, draw the diagram as inline SVG: it scales with the page, stays selectable and searchable, and takes the page's colours. Labels may use any language here, since SVG positions text by coordinates instead of columns.

## Appearance

| Part | Style |
|------|-------|
| Colour | CSS variables on `:root`, light theme by default |
| Node | Rounded rectangle, one stroke width throughout |
| Edge | Straight or right-angled path, arrowhead `marker` |
| Text | Page font, at least 12px, `text-anchor="middle"` |
| Emphasis | One accent colour; everything else neutral |

Add a dark theme only when asked, by redefining the variables, so one set of colours stays the source. Colour and dashes carry meaning only when the notes explain them. Size the `viewBox` to the content and let the SVG fill the container width, so it fits a phone screen.

```html
<svg viewBox="0 0 360 80" role="img" aria-label="Main queries Store">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <path d="M0 0L10 5L0 10z" fill="var(--line)"/>
    </marker>
  </defs>
  <rect x="10" y="20" width="110" height="40" rx="8" fill="var(--node)" stroke="var(--line)"/>
  <text x="65" y="45" text-anchor="middle" fill="var(--text)">Main (a)</text>
  <path d="M120 40H230" stroke="var(--line)" marker-end="url(#arrow)"/>
  <text x="175" y="32" text-anchor="middle" fill="var(--muted)">queries</text>
  <rect x="240" y="20" width="110" height="40" rx="8" fill="var(--node)" stroke="var(--line)"/>
  <text x="295" y="45" text-anchor="middle" fill="var(--text)">Store (b)</text>
</svg>
```

Write the lettered notes as an HTML list after the SVG, where text wraps and reads naturally.

## Icons

An icon helps a reader recognise a node faster; place at most one per node, beside its label, and keep the label.

| Source | Use for | License |
|--------|---------|---------|
| [Lucide](https://lucide.dev) | Generic concepts: database, user, server | ISC |
| [svgl](https://svgl.app) | Products and brands: GitHub, PostgreSQL | MIT code; marks belong to their owners |

Use a brand logo only to name that product. Fetch icons with the script, which prints inline SVG ready to nest in the diagram:

```bash
python3 ${CLAUDE_SKILL_DIR}/scripts/icon.py lucide database --size 20
python3 ${CLAUDE_SKILL_DIR}/scripts/icon.py brand postgresql --size 20 --theme dark
```

The root `<svg>` takes `x` and `y` like any element, so place an icon by adding them. Lucide icons draw with `currentColor` and follow the text colour. A brand logo keeps its own colours; for a page with both themes, pass `--current-color` to recolour a single-colour logo such as GitHub's, or pick the light or dark file to match a fixed theme.

Check the result by rendering a screenshot: a label crossing a line or a group border is visible only there.
