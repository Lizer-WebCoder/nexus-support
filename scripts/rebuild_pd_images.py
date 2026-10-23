#!/usr/bin/env python3
import base64
from pathlib import Path
Path('public').mkdir(exist_ok=True)
for tag, name in [('n', 'portal-desert-night.jpg'), ('d', 'portal-desert-day.jpg')]:
    single = Path(f'scripts/pd_{name.split("-")[2].split(".")[0]}.b64')
    # scripts/pd_night.b64 or parts
    parts = sorted(Path('scripts/pd_b64').glob(f'{tag}*.txt'), key=lambda p: int(''.join(c for c in p.stem if c.isdigit()) or 0))
    if not parts:
        print('missing', tag)
        continue
    data = ''.join(p.read_text().strip() for p in parts)
    Path('public', name).write_bytes(base64.b64decode(data))
    print(name, Path('public', name).stat().st_size)
