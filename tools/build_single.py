#!/usr/bin/env python3
"""Genera dist/jardin-como-interfaz.html: un solo archivo con CSS y JS en línea.

Sirve para republicar el sitio como artifact de claude.ai o para compartirlo
como un único archivo. La reproducción (img/) no se incrusta: si el archivo
se abre lejos de esa carpeta, el sitio muestra el esquema SVG. Uso, desde la
raíz del proyecto:

    python3 tools/build_single.py
"""
from pathlib import Path
import re

root = Path(__file__).resolve().parent.parent
html = (root / "index.html").read_text(encoding="utf-8")


def inline_css(m):
    css = (root / m.group(1)).read_text(encoding="utf-8")
    return "<style>\n" + css + "\n</style>"


def inline_js(m):
    js = (root / m.group(1)).read_text(encoding="utf-8")
    return "<script>\n" + js.replace("</script", "<\\/script") + "\n</script>"


html = re.sub(r'<link rel="stylesheet" href="(css/[^"]+)">', inline_css, html)
html = re.sub(r'<script src="(js/[^"]+)"></script>', inline_js, html)

out = root / "dist" / "jardin-como-interfaz.html"
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding="utf-8")
print(f"Generado {out.relative_to(root)} ({out.stat().st_size // 1024} KB)")
