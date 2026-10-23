#!/usr/bin/env python3
from pathlib import Path
p = Path('src/index.css')
t = p.read_text()
if "portal-desert.css" not in t:
    # after tailwind utilities
    t = t.replace(
        '@tailwind utilities;\n',
        "@tailwind utilities;\n@import './portal-desert.css';\n",
        1,
    )
    p.write_text(t)
    print('import added')
else:
    print('import already present')
