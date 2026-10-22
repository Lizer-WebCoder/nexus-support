#!/usr/bin/env python3
from pathlib import Path
p = Path('src/index.css')
t = p.read_text()
if t.strip() == 'PLACEHOLDER' or len(t) < 200:
    raise SystemExit('css empty')
old = '''.login-glass-card {
  background: linear-gradient(
    155deg,
    rgba(98, 32, 150, 0.42) 0%,
    rgba(40, 12, 70, 0.48) 40%,
    rgba(18, 6, 42, 0.55) 100%
  );
  backdrop-filter: blur(24px) saturate(1.4);
  -webkit-backdrop-filter: blur(24px) saturate(1.4);
  border: 1px solid rgba(216, 180, 254, 0.32);
  box-shadow:
    0 20px 50px rgba(0, 0, 20, 0.55),
    0 0 0 1px rgba(139, 92, 246, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.14);
}'''
new = '''.login-glass-card {
  background: linear-gradient(
    155deg,
    rgba(98, 32, 150, 0.22) 0%,
    rgba(40, 12, 70, 0.28) 40%,
    rgba(18, 6, 42, 0.32) 100%
  );
  backdrop-filter: blur(18px) saturate(1.25);
  -webkit-backdrop-filter: blur(18px) saturate(1.25);
  border: 1px solid rgba(216, 180, 254, 0.22);
  box-shadow:
    0 16px 40px rgba(0, 0, 20, 0.4),
    0 0 0 1px rgba(139, 92, 246, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}'''
if old in t:
    t = t.replace(old, new)
    print('glass patched')
elif 'rgba(98, 32, 150, 0.22)' in t:
    print('already transparent')
else:
    print('glass block not found; len', len(t))
p.write_text(t)
print('css bytes', len(t))
