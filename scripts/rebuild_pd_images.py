#!/usr/bin/env python3
import base64
from pathlib import Path

Path('public').mkdir(exist_ok=True)
root = Path('scripts/pd_b64')
for tag, name in [('n', 'portal-desert-night.webp'), ('d', 'portal-desert-day.webp')]:
    parts = sorted(root.glob(f'{tag}*.txt'), key=lambda p: int(''.join(c for c in p.stem if c.isdigit()) or 0))
    if not parts:
        print('skip', tag)
        continue
    data = ''.join(p.read_text().strip() for p in parts)
    out = Path('public') / name
    out.write_bytes(base64.b64decode(data))
    print(out, out.stat().st_size)
