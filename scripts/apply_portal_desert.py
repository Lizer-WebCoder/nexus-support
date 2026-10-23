#!/usr/bin/env python3
"""Wire desert bg + glass cards + tighter spacing into CustomerPortal & PortalHome."""
from pathlib import Path

# --- CustomerPortal ---
cp = Path('src/components/CustomerPortal.tsx')
t = cp.read_text()

if "PortalDesertBg" not in t:
    t = t.replace(
        "import ThemeToggle from './ThemeToggle';",
        "import ThemeToggle from './ThemeToggle';\nimport PortalDesertBg from './PortalDesertBg';",
    )

# Wrap content column with desert background
old_col = '''      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header className="h-14 shrink-0 nexus-topbar flex items-center gap-3 px-4 lg:px-6">'''
new_col = '''      <div className="portal-content flex-1 flex flex-col min-w-0 min-h-screen relative overflow-hidden">
        <PortalDesertBg />
        <header className="relative z-20 h-12 shrink-0 nexus-topbar flex items-center gap-3 px-4 lg:px-6">'''
if old_col in t:
    t = t.replace(old_col, new_col)

# main area z-index + tighter padding
t = t.replace(
    '<main className="flex-1 overflow-y-auto p-4 lg:p-6">',
    '<main className="relative z-10 flex-1 overflow-y-auto p-3 lg:p-5">',
)

# Glass cards: replace opaque white cards in portal views
replacements = [
    ('className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-4"',
     'className="portal-glass-card rounded-xl p-4 sm:p-5 space-y-3"'),
    ('className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-4 mt-4"',
     'className="portal-glass-card rounded-xl p-4 sm:p-5 space-y-3 mt-3"'),
    ('className="mt-4 bg-white rounded-xl border border-zinc-200 p-5 space-y-3 shadow-sm"',
     'className="mt-3 portal-glass-card rounded-xl p-4 space-y-2.5"'),
    ('className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-4"',
     'className="portal-glass-card rounded-xl p-4 sm:p-5 space-y-3"'),
    ('className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden"',
     'className="portal-glass-card rounded-xl overflow-hidden"'),
    ('className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 hover:border-violet-200 transition-colors text-left"',
     'className="portal-glass-card rounded-xl p-3.5 hover:border-violet-300/60 transition-colors text-left"'),
    ('className="px-4 py-2 border border-zinc-200 text-sm rounded-lg bg-white hover:bg-zinc-50"',
     'className="px-4 py-2 border border-zinc-200/60 text-sm rounded-lg portal-glass-card hover:bg-white/40"'),
    # tighter back links / titles
    ('className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-5"',
     'className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-3"'),
    ('className="text-xl font-semibold text-zinc-900 mb-5"',
     'className="text-lg font-semibold text-zinc-900 mb-3"'),
    ('className="text-xl font-semibold text-zinc-900 tracking-tight"',
     'className="text-lg font-semibold text-zinc-900 tracking-tight"'),
    ('className="mb-5"',
     'className="mb-3"'),
    ('className="space-y-3 mt-1"',
     'className="space-y-2 mt-1"'),
]
for a, b in replacements:
    t = t.replace(a, b)

# field styles slightly glassier
t = t.replace(
    "'w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-400 focus:bg-white text-zinc-900 placeholder:text-zinc-400'",
    "'w-full px-3 py-2 text-sm border border-zinc-200/70 rounded-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-400 focus:bg-white/80 text-zinc-900 placeholder:text-zinc-400'",
)

cp.write_text(t)
print('CustomerPortal patched', 'PortalDesertBg' in t)

# --- PortalHome: drop local ambient (global desert covers it), more transparent cards ---
ph = Path('src/components/PortalHome.tsx')
h = ph.read_text()
# Remove AmbientField usage; keep structure
if 'AmbientField' in h and 'portal-desert' not in h:
    # Simplify: remove AmbientField component body by not rendering it
    h = h.replace('      <AmbientField />\n\n', '')
    h = h.replace('bg-white/90', 'bg-white/55')
    h = h.replace('from-violet-50/90 via-white/90 to-white/90', 'from-violet-50/50 via-white/45 to-white/40')
    h = h.replace('className="portal-home relative"', 'className="portal-home relative"')
    ph.write_text(h)
    print('PortalHome softened transparency')
else:
    print('PortalHome skip', 'AmbientField' in h)

# --- CSS append ---
css_path = Path('src/index.css')
css = css_path.read_text()
if 'portal-desert' not in css:
    css += r'''

/* —— Customer portal desert night sky (light + dark) —— */
.portal-content {
  isolation: isolate;
}
.portal-desert {
  pointer-events: none;
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  --pd-dune-top: #c4b5fd;
  --pd-dune-bot: #a78bfa;
  --pd-ridge: #8b5cf6;
  --pd-sand: #ddd6fe;
  --pd-cactus: #7c3aed;
}
.portal-desert-sky {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 50% 40% at 78% 18%, rgba(255, 255, 255, 0.55), transparent 55%),
    radial-gradient(ellipse 80% 50% at 50% 0%, rgba(147, 197, 253, 0.45), transparent 60%),
    linear-gradient(180deg, #1e1b4b 0%, #312e81 28%, #4c1d95 55%, #7c3aed 78%, #c4b5fd 100%);
}
html.nexus-light .portal-desert {
  --pd-dune-top: #e9d5ff;
  --pd-dune-bot: #ddd6fe;
  --pd-ridge: #c4b5fd;
  --pd-sand: #f5f3ff;
  --pd-cactus: #8b5cf6;
}
html.nexus-light .portal-desert-sky {
  background:
    radial-gradient(ellipse 45% 35% at 78% 16%, rgba(255, 255, 255, 0.85), transparent 55%),
    radial-gradient(ellipse 70% 45% at 40% 10%, rgba(191, 219, 254, 0.55), transparent 55%),
    linear-gradient(180deg, #93c5fd 0%, #a5b4fc 30%, #c4b5fd 58%, #e9d5ff 82%, #faf5ff 100%);
}
html.nexus-dark .portal-desert {
  --pd-dune-top: #6d28d9;
  --pd-dune-bot: #4c1d95;
  --pd-ridge: #2e1065;
  --pd-sand: #3b0764;
  --pd-cactus: #a78bfa;
}
html.nexus-dark .portal-desert-sky {
  background:
    radial-gradient(ellipse 40% 35% at 78% 14%, rgba(255, 255, 255, 0.35), transparent 50%),
    radial-gradient(ellipse 60% 40% at 30% 5%, rgba(59, 130, 246, 0.25), transparent 55%),
    linear-gradient(180deg, #0c0a1f 0%, #1e1b4b 32%, #312e81 58%, #4c1d95 82%, #5b21b6 100%);
}

.portal-desert-stars { position: absolute; inset: 0 0 42% 0; }
.portal-desert-star {
  position: absolute;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.85);
  animation: portal-desert-twinkle ease-in-out infinite;
}
html.nexus-light .portal-desert-star {
  background: #fff;
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.9);
  opacity: 0.85;
}
@keyframes portal-desert-twinkle {
  0%, 100% { opacity: 0.25; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1.2); }
}

.portal-desert-shoot {
  position: absolute;
  width: 90px;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, #e0f2fe 40%, #fff 100%);
  box-shadow: 0 0 8px 2px rgba(125, 211, 252, 0.55);
  opacity: 0;
  animation: portal-desert-meteor 9s linear infinite;
}
.portal-desert-shoot-a { top: 12%; left: 10%; animation-delay: 0s; }
.portal-desert-shoot-b { top: 22%; left: 45%; width: 70px; animation-delay: 3.2s; animation-duration: 11s; }
.portal-desert-shoot-c { top: 8%; left: 60%; width: 110px; animation-delay: 6.5s; animation-duration: 10s; }
@keyframes portal-desert-meteor {
  0% { opacity: 0; transform: translate(0, 0) rotate(-32deg); }
  4% { opacity: 1; }
  18% { opacity: 0; transform: translate(280px, 160px) rotate(-32deg); }
  100% { opacity: 0; transform: translate(280px, 160px) rotate(-32deg); }
}

.portal-desert-moon {
  position: absolute;
  top: 8%;
  right: 12%;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #fff 0%, #e0f2fe 40%, #93c5fd 100%);
  box-shadow:
    0 0 40px 12px rgba(255, 255, 255, 0.45),
    0 0 80px 24px rgba(147, 197, 253, 0.25);
  animation: portal-desert-moon-pulse 6s ease-in-out infinite alternate;
}
html.nexus-light .portal-desert-moon {
  width: 64px;
  height: 64px;
  background: radial-gradient(circle at 35% 35%, #fff 0%, #fef9c3 45%, #fde68a 100%);
  box-shadow: 0 0 36px 10px rgba(253, 224, 71, 0.45);
}
html.nexus-dark .portal-desert-moon {
  width: 80px;
  height: 80px;
  box-shadow:
    0 0 48px 16px rgba(255, 255, 255, 0.35),
    0 0 100px 30px rgba(99, 102, 241, 0.3);
}
@keyframes portal-desert-moon-pulse {
  from { transform: scale(1); filter: brightness(1); }
  to { transform: scale(1.04); filter: brightness(1.08); }
}

.portal-desert-cloud {
  position: absolute;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  filter: blur(8px);
  animation: portal-desert-cloud-drift 40s linear infinite;
}
.portal-desert-cloud-a {
  width: 180px; height: 36px; top: 28%; left: -10%;
}
.portal-desert-cloud-b {
  width: 140px; height: 28px; top: 36%; left: 40%;
  animation-duration: 55s; animation-direction: reverse;
  opacity: 0.7;
}
html.nexus-light .portal-desert-cloud {
  background: rgba(255, 255, 255, 0.55);
}
@keyframes portal-desert-cloud-drift {
  from { transform: translateX(0); }
  to { transform: translateX(120vw); }
}

.portal-desert-land {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  width: 100%;
  height: min(38%, 280px);
}
.portal-desert-cactus {
  position: absolute;
  bottom: 6%;
  width: 36px;
  height: 64px;
  opacity: 0.85;
}
.portal-desert-cactus-l { left: 6%; }
.portal-desert-cactus-r { right: 8%; width: 40px; height: 72px; }

/* Glass cards over desert */
.portal-glass-card {
  background: rgba(255, 255, 255, 0.58);
  border: 1px solid rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(14px) saturate(1.15);
  -webkit-backdrop-filter: blur(14px) saturate(1.15);
  box-shadow: 0 8px 28px rgba(49, 46, 129, 0.08);
}
html.nexus-dark .portal-glass-card {
  background: rgba(24, 16, 48, 0.55);
  border-color: rgba(196, 181, 253, 0.22);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.28);
}
html.nexus-light .portal-glass-card {
  background: rgba(255, 255, 255, 0.62);
  border-color: rgba(139, 92, 246, 0.18);
}

/* Home cards already use portal-home-card — make them more transparent */
.portal-home-card {
  background: rgba(255, 255, 255, 0.55) !important;
  backdrop-filter: blur(12px);
}
html.nexus-dark .portal-home-card {
  background: rgba(30, 16, 60, 0.5) !important;
}
.portal-home-hero {
  background: rgba(255, 255, 255, 0.5) !important;
  backdrop-filter: blur(14px);
}
html.nexus-dark .portal-home-hero {
  background: rgba(46, 16, 101, 0.45) !important;
}
/* Hide old local ambient when desert is present */
.portal-content .portal-home-ambient { display: none; }
'''
    css_path.write_text(css)
    print('CSS desert appended')
else:
    print('CSS already has desert')

print('done')
