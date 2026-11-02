#!/usr/bin/env python3
"""Print an icon as inline SVG, ready to nest inside a diagram.

Sources:
  lucide NAME   generic concept icon from Lucide (ISC), drawn in currentColor
  brand NAME    product logo from svgl (MIT code; marks belong to their owners)

Usage:
  icon.py lucide database --size 20
  icon.py brand postgresql --size 20 --theme dark
  icon.py brand github --current-color   # recolour to follow the text colour
  icon.py brand --search git      # list matching brand names
"""

import argparse
import json
import re
import sys
import urllib.parse
import urllib.request

LUCIDE = "https://unpkg.com/lucide-static@latest/icons/{name}.svg"
SVGL = "https://api.svgl.app?search={query}"


def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": "concise-diagram"})
    with urllib.request.urlopen(request, timeout=15) as response:
        return response.read().decode("utf-8")


def resize(svg, size):
    """Set width and height on the root element, keeping its viewBox."""
    svg = re.sub(r"<\?xml[^>]*>\s*|<!--.*?-->\s*", "", svg, flags=re.S).strip()
    m = re.search(r"(<svg\b[^>]*>)(.*)", svg, flags=re.S)
    if not m:
        sys.exit("response is not an SVG")
    head, rest = m.groups()
    head = re.sub(r"\s+", " ", re.sub(r'\s(width|height)="[^"]*"', "", head))
    return head.replace("<svg", f'<svg width="{size}" height="{size}"', 1) + rest


def recolour(svg):
    """Replace literal fill and stroke colours with currentColor."""
    colour = r"#[0-9a-fA-F]{3,8}\b|rgb\([^)]*\)|\b(?:black|white)\b"
    svg = re.sub(rf'((?:fill|stroke)\s*=\s*")(?:{colour})(")', r"\1currentColor\2", svg)
    return re.sub(rf"((?:fill|stroke)\s*:\s*)(?:{colour})", r"\1currentColor", svg)


def brands(query):
    try:
        found = json.loads(fetch(SVGL.format(query=urllib.parse.quote(query))))
    except Exception:
        return []
    return found if isinstance(found, list) else []


def brand_url(name, theme):
    matches = brands(name)
    exact = [b for b in matches if b["title"].lower() == name.lower()]
    if not (exact or matches):
        sys.exit(f"no brand matches {name!r}; try --search")
    route = (exact or matches)[0]["route"]
    return route[theme] if isinstance(route, dict) else route


def main():
    ap = argparse.ArgumentParser(description=(__doc__ or "").split("\n\n")[0])
    ap.add_argument("source", choices=["lucide", "brand"])
    ap.add_argument("name", nargs="?")
    ap.add_argument("--size", type=int, default=20)
    ap.add_argument("--theme", choices=["light", "dark"], default="light")
    ap.add_argument("--search", metavar="QUERY", help="list brand names matching QUERY")
    ap.add_argument("--current-color", action="store_true", help="recolour to follow the text colour")
    args = ap.parse_args()

    if args.search:
        for b in brands(args.search):
            print(b["title"])
        return
    if not args.name:
        ap.error("NAME is required unless --search is given")
    if args.source == "lucide":
        url = LUCIDE.format(name=urllib.parse.quote(args.name.lower()))
    else:
        url = brand_url(args.name, args.theme)
    try:
        svg = resize(fetch(url), args.size)
        print(recolour(svg) if args.current_color else svg)
    except Exception as e:
        sys.exit(f"cannot fetch {url}: {e}")


if __name__ == "__main__":
    main()
