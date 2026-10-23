#!/usr/bin/env python3
from pathlib import Path
p = Path('src/components/PostLoginLoader.tsx')
t = p.read_text()
old = '''          <PostLoginLoader label={label} fading={false} variant={variant} />
          {overlayFading && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse 90% 60% at 50% 40%, rgba(255,255,255,0.12), transparent 55%),' +
                  'radial-gradient(ellipse 70% 50% at 50% 70%, rgba(196,181,253,0.15), transparent 60%)',
                animation: 'pl-mist 1.4s ease-out both',
              }}
            />
          )}'''
new = '          <PostLoginLoader label={label} fading={false} variant={variant} />'
if old not in t:
    if 'pl-mist' not in t:
        print('mist already removed')
    else:
        raise SystemExit('mist block not found')
else:
    t = t.replace(old, new)
    print('removed mist overlay')
# drop unused keyframes
t = t.replace('''
        @keyframes pl-mist {
          0% { opacity: 0.5; }
          40% { opacity: 0.85; }
          100% { opacity: 0; }
        }''', '')
p.write_text(t)
print('ok', 'pl-mist' in t, len(t))
