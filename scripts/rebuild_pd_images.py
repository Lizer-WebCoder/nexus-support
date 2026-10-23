#!/usr/bin/env python3
import base64
from pathlib import Path
Path('public').mkdir(exist_ok=True)
for tag, out in [('n', 'public/portal-desert-night.jpg'), ('d', 'public/portal-desert-day.jpg')]:
    files = sorted(Path('scripts/pd_b64').glob(f'{tag}*.txt'), key=lambda p: int(p.stem[1:]))
    data = ''.join(f.read_text().strip() for f in files)
    Path(out).write_bytes(base64.b64decode(data))
    print(out, Path(out).stat().st_size)
