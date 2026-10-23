#!/usr/bin/env python3
import base64
from pathlib import Path
Path('public').mkdir(exist_ok=True)
for tag, name in [('n', 'portal-desert-night.jpg'), ('d', 'portal-desert-day.jpg')]:
    parts = sorted(Path('scripts/pd_b64').glob(f'{tag}*.txt'), key=lambda p: int(''.join(c for c in p.stem if c.isdigit()) or 0))
    data = ''.join(p.read_text().strip() for p in parts)
    Path('public', name).write_bytes(base64.b64decode(data))
    print(name, Path('public', name).stat().st_size)
