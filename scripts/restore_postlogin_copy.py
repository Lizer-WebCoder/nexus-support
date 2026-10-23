#!/usr/bin/env python3
from pathlib import Path
src = Path('scripts/_PostLoginLoader_source.tsx')
dst = Path('src/components/PostLoginLoader.tsx')
if not src.exists():
    raise SystemExit('missing source')
dst.write_text(src.read_text())
t = dst.read_text()
assert 'showOverlay' in t and 'PLACEHOLDER' not in t
print('restored', len(t))
