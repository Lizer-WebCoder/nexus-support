#!/usr/bin/env python3
from pathlib import Path
import subprocess

# Prefer recovering the last good merge version
try:
    t = subprocess.check_output(
        ['git', 'show', '6507243a48984a432047da1d574e8307bc05552b:src/components/PostLoginLoader.tsx'],
        text=True,
    )
except Exception:
    t = Path('src/components/PostLoginLoader.tsx').read_text()
    if 'PLACEHOLDER' in t or len(t) < 500:
        raise SystemExit('cannot recover PostLoginLoader')

t = t.replace('const FADE_MS = 1400;', 'const FADE_MS = 900;')
t = t.replace('const FADE_MS = 1200;', 'const FADE_MS = 900;')

old = '''  const showOverlay = mode === 'ceremony' || mode === 'fading';
  const showPortal = mode === 'fading' || mode === 'done';
  const overlayFading = mode === 'fading';

  return (
    <div className="relative min-h-screen bg-[#0b0618]">
      {showPortal && (
        <div
          className="relative z-0 min-h-screen"
          style={{
            opacity: mode === 'done' ? 1 : 0.92,
            animation:
              mode === 'done'
                ? 'pl-portal-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) both'
                : undefined,
            transition: `opacity ${FADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          }}
        >
          {children}
        </div>
      )}

      {showOverlay && (
        <div
          className="fixed inset-0 z-50 pointer-events-none"
          style={{
            opacity: overlayFading ? 0 : 1,
            transition: `opacity ${FADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          }}
        >
          <PostLoginLoader label={label} fading={false} variant={variant} />
        </div>
      )}

      <style>{`
        @keyframes pl-portal-in {
          from { opacity: 0.85; filter: blur(6px); transform: scale(1.01); }
          to { opacity: 1; filter: blur(0); transform: scale(1); }
        }
      `}</style>
    </div>
  );
}'''

new = '''  const showOverlay = mode === 'ceremony' || mode === 'fading';
  const showPortal = mode === 'fading' || mode === 'done';
  const overlayFading = mode === 'fading';

  // Portal stays sharp under the overlay. Only the cosmic layer fades out.
  return (
    <div className="relative min-h-screen bg-[#0b0618]">
      {showPortal && (
        <div className="relative z-0 min-h-screen">
          {children}
        </div>
      )}

      {showOverlay && (
        <div
          className="fixed inset-0 z-50 pointer-events-none"
          style={{
            opacity: overlayFading ? 0 : 1,
            transition: `opacity ${FADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          }}
        >
          <PostLoginLoader label={label} fading={false} variant={variant} />
        </div>
      )}
    </div>
  );
}'''

if 'pl-portal-in' in t and old in t:
    t = t.replace(old, new)
elif 'pl-portal-in' not in t and 'showOverlay' in t and 'PLACEHOLDER' not in t:
    print('already fixed')
else:
    if old not in t:
        raise SystemExit('pattern missing')
    t = t.replace(old, new)

Path('src/components/PostLoginLoader.tsx').write_text(t)
out = Path('src/components/PostLoginLoader.tsx').read_text()
assert 'PLACEHOLDER' not in out and 'SpaceScene' in out and 'pl-portal-in' not in out
print('applied', len(out))
