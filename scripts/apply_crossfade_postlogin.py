#!/usr/bin/env python3
"""Restore space scene from last good commit, then apply crossfade PostLoginShell."""
import subprocess
from pathlib import Path

# Recover base from commit before PLACEHOLDER
base = subprocess.check_output(
    ['git', 'show', '43ede7c4024c9079ab7bb7c7149e37779188350b:src/components/PostLoginLoader.tsx'],
    text=True,
)
t = base.replace('const FADE_MS = 1200;', 'const FADE_MS = 1400;')
start = t.find('export function PostLoginShell')
if start < 0:
    raise SystemExit('PostLoginShell not found')

new_shell = r'''export function PostLoginShell({
  ready,
  label,
  variant = 'agent',
  children,
}: {
  ready: boolean;
  label: string;
  subtitle?: string;
  variant?: 'agent' | 'customer';
  children: ReactNode;
}) {
  const [mode, setMode] = useState<'wait' | 'ceremony' | 'fading' | 'done'>('wait');
  const started = useRef(false);
  const wantCeremony = useRef(false);

  useEffect(() => {
    if (!ready) {
      started.current = false;
      setMode('wait');
      return;
    }

    if (!started.current) {
      started.current = true;
      wantCeremony.current = hasJustLoggedIn();
      if (!wantCeremony.current) {
        setMode('done');
        return;
      }
      setMode('ceremony');
      const t = window.setTimeout(() => setMode('fading'), MIN_MS);
      return () => window.clearTimeout(t);
    }
  }, [ready]);

  useEffect(() => {
    if (mode !== 'fading') return;
    const t = window.setTimeout(() => {
      clearJustLoggedIn();
      setMode('done');
    }, FADE_MS);
    return () => window.clearTimeout(t);
  }, [mode]);

  useEffect(() => {
    if (!ready || mode === 'ceremony' || mode === 'fading') return;
    if (!hasJustLoggedIn()) return;
    if (wantCeremony.current && mode === 'done') return;
    wantCeremony.current = true;
    started.current = true;
    setMode('ceremony');
    const t = window.setTimeout(() => setMode('fading'), MIN_MS);
    return () => window.clearTimeout(t);
  }, [ready, mode]);

  if (!ready || mode === 'wait') {
    return <BootLoader label={label} />;
  }

  if (mode === 'done' && !wantCeremony.current) {
    return <>{children}</>;
  }

  const showOverlay = mode === 'ceremony' || mode === 'fading';
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
          )}
        </div>
      )}

      <style>{`
        @keyframes pl-portal-in {
          from { opacity: 0.85; filter: blur(6px); transform: scale(1.01); }
          to { opacity: 1; filter: blur(0); transform: scale(1); }
        }
        @keyframes pl-mist {
          0% { opacity: 0.5; }
          40% { opacity: 0.85; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
'''

Path('src/components/PostLoginLoader.tsx').write_text(t[:start] + new_shell)
out = Path('src/components/PostLoginLoader.tsx').read_text()
assert 'showOverlay' in out and 'PLACEHOLDER' not in out and 'SpaceScene' in out
print('applied crossfade', len(out))
