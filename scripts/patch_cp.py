#!/usr/bin/env python3
from pathlib import Path
import urllib.request

url = "https://raw.githubusercontent.com/Right-Click-V4/nexus-support/e973f0632f202e8dc0dabbbc65a8be25600c23f9/src/components/CustomerPortal.tsx"
data = urllib.request.urlopen(url).read()
Path("src/components/CustomerPortal.tsx").write_bytes(data)
t = data.decode()
reps = [
    (
        "hidden md:flex w-60 shrink-0 bg-zinc-950 text-zinc-100 flex-col border-r border-zinc-800 relative z-30",
        "portal-sidebar hidden md:flex w-60 shrink-0 flex-col relative z-30",
    ),
    (
        "px-4 py-5 flex items-center gap-3 border-b border-zinc-800/80",
        "portal-sidebar-header px-4 py-5 flex items-center gap-3",
    ),
    (
        'text-sm font-semibold tracking-tight">Nexus Ops',
        'text-sm font-semibold tracking-tight portal-sidebar-title">Nexus Ops',
    ),
    (
        'text-[11px] text-zinc-500">Customer portal',
        'text-[11px] portal-sidebar-sub">Customer portal',
    ),
    (
        'text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Support',
        'text-[10px] font-semibold uppercase tracking-wider portal-sidebar-label">Support',
    ),
    (
        "p-3 border-t border-zinc-800/80 space-y-1",
        "portal-sidebar-footer p-3 space-y-1",
    ),
    (
        "active ? 'bg-brand-600/20 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'",
        "active ? 'portal-nav-active' : 'portal-nav-item'",
    ),
    (
        '<Icon size={18} className="shrink-0" />',
        '<Icon size={18} className={`shrink-0 ${({ home: "text-violet-400", community: "text-sky-400", submit: "text-amber-400", chat: "text-fuchsia-400", track: "text-emerald-400", mytickets: "text-blue-400", help: "text-indigo-400", account: "text-pink-400" } as Record<string, string>)[item.id] || "text-violet-400"}`} />',
    ),
]
for a, b in reps:
    if a not in t:
        print("MISS", a[:50])
    else:
        t = t.replace(a, b, 1)
        print("OK", a[:40])
Path("src/components/CustomerPortal.tsx").write_text(t)
print("size", len(t), "sidebar", "portal-sidebar" in t)

css_path = Path("src/portal-lounge.css")
css = css_path.read_text() if css_path.exists() else ""
if "portal-comet-head" not in css:
    css += """

.portal-sidebar{background:rgba(245,243,255,.72)!important;backdrop-filter:blur(18px);border-right:1px solid rgba(196,181,253,.35);color:#1e1b4b}
html.nexus-dark .portal-sidebar{background:rgba(12,8,28,.78)!important;border-right-color:rgba(63,63,70,.45);color:#f4f4f5}
.app-cosmos>aside.portal-sidebar{background:rgba(245,243,255,.72)!important}
html.nexus-dark .app-cosmos>aside.portal-sidebar{background:rgba(12,8,28,.78)!important}
.portal-sidebar-header{border-bottom:1px solid rgba(196,181,253,.3)}
html.nexus-dark .portal-sidebar-header{border-bottom-color:rgba(63,63,70,.5)}
.portal-sidebar-title{color:#1e1b4b}
html.nexus-dark .portal-sidebar-title{color:#fafafa}
.portal-sidebar-sub{color:#7c3aed}
html.nexus-dark .portal-sidebar-sub{color:#a1a1aa}
.portal-sidebar-label{color:#8b5cf6}
html.nexus-dark .portal-sidebar-label{color:#71717a}
.portal-sidebar-footer{border-top:1px solid rgba(196,181,253,.3)}
html.nexus-dark .portal-sidebar-footer{border-top-color:rgba(63,63,70,.5)}
.portal-nav-item{color:#4c1d95}
.portal-nav-item:hover{background:rgba(139,92,246,.12)}
html.nexus-dark .portal-nav-item{color:#a1a1aa}
html.nexus-dark .portal-nav-item:hover{background:rgba(255,255,255,.06);color:#e4e4e7}
.portal-nav-active{background:rgba(124,58,237,.18)!important;color:#2e1065!important}
html.nexus-dark .portal-nav-active{background:rgba(124,58,237,.28)!important;color:#fff!important}
.portal-shooting-star{position:absolute;left:0;width:110px;height:22px;opacity:0;animation:portal-comet-fly 30s linear infinite;background:none!important;box-shadow:none!important}
.portal-shooting-1{top:16%;animation-delay:2s}
.portal-shooting-2{top:40%;animation-delay:12s}
.portal-shooting-3{top:65%;animation-delay:22s}
.portal-comet-trail{position:absolute;right:14px;top:50%;height:3px;width:90px;border-radius:999px;transform:translateY(-50%);background:linear-gradient(90deg,transparent,rgba(34,211,238,.2) 40%,#fff);box-shadow:0 0 8px 2px rgba(34,211,238,.5)}
.portal-comet-trail-a{width:90px;height:4px}
.portal-comet-trail-b{width:68px;height:2.5px;opacity:.75}
.portal-comet-trail-c{width:48px;height:2px;opacity:.55}
.portal-comet-head{position:absolute;right:0;top:50%;width:10px;height:10px;transform:translateY(-50%);border-radius:50%;background:radial-gradient(circle,#fff,#a5f3fc 45%,#22d3ee 75%,transparent);box-shadow:0 0 12px 3px rgba(34,211,238,.9)}
.portal-comet-particle{position:absolute;width:3px;height:3px;border-radius:50%;background:#a5f3fc}
.portal-comet-p1{right:28px;top:30%}
.portal-comet-p2{right:44px;top:60%}
.portal-comet-p3{right:58px;top:25%}
@keyframes portal-comet-fly{0%,88%{opacity:0;transform:translate3d(-120px,0,0) rotate(-8deg)}90%{opacity:1}97%{opacity:.9;transform:translate3d(110vw,50px,0) rotate(-8deg)}100%{opacity:0}}
"""
    css_path.write_text(css)
    print("css appended")
else:
    print("css already has rules")
