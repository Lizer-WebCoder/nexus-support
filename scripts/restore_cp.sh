#!/usr/bin/env bash
set -euo pipefail
curl -fsSL "https://raw.githubusercontent.com/Right-Click-V4/nexus-support/e973f0632f202e8dc0dabbbc65a8be25600c23f9/src/components/CustomerPortal.tsx" -o src/components/CustomerPortal.tsx
wc -c src/components/CustomerPortal.tsx
grep -q "export default function CustomerPortal" src/components/CustomerPortal.tsx
sed -i 's/bg-zinc-950 text-zinc-100 flex-col border-r border-zinc-800 relative z-30/portal-sidebar flex-col relative z-30/' src/components/CustomerPortal.tsx
if ! grep -q portal-comet-head src/portal-lounge.css; then
cat >> src/portal-lounge.css << 'EOF'

.portal-sidebar{background:rgba(245,243,255,.72)!important;backdrop-filter:blur(18px);border-right:1px solid rgba(196,181,253,.35);color:#1e1b4b}
html.nexus-dark .portal-sidebar{background:rgba(12,8,28,.78)!important;border-right-color:rgba(63,63,70,.45);color:#f4f4f5}
.app-cosmos>aside.portal-sidebar{background:rgba(245,243,255,.72)!important}
html.nexus-dark .app-cosmos>aside.portal-sidebar{background:rgba(12,8,28,.78)!important}
.portal-shooting-star{position:absolute;left:0;width:110px;height:22px;opacity:0;animation:portal-comet-fly 30s linear infinite;background:none!important;box-shadow:none!important}
.portal-shooting-1{top:16%;animation-delay:2s}.portal-shooting-2{top:40%;animation-delay:12s}.portal-shooting-3{top:65%;animation-delay:22s}
.portal-comet-trail{position:absolute;right:14px;top:50%;height:3px;width:90px;border-radius:999px;transform:translateY(-50%);background:linear-gradient(90deg,transparent,rgba(34,211,238,.2) 40%,#fff);box-shadow:0 0 8px 2px rgba(34,211,238,.5)}
.portal-comet-trail-a{width:90px;height:4px}.portal-comet-trail-b{width:68px;height:2.5px;opacity:.75}.portal-comet-trail-c{width:48px;height:2px;opacity:.55}
.portal-comet-head{position:absolute;right:0;top:50%;width:10px;height:10px;transform:translateY(-50%);border-radius:50%;background:radial-gradient(circle,#fff,#a5f3fc 45%,#22d3ee 75%,transparent);box-shadow:0 0 12px 3px rgba(34,211,238,.9)}
.portal-comet-particle{position:absolute;width:3px;height:3px;border-radius:50%;background:#a5f3fc}
.portal-comet-p1{right:28px;top:30%}.portal-comet-p2{right:44px;top:60%}.portal-comet-p3{right:58px;top:25%}
@keyframes portal-comet-fly{0%,88%{opacity:0;transform:translate3d(-120px,0,0) rotate(-8deg)}90%{opacity:1}97%{opacity:.9;transform:translate3d(110vw,50px,0) rotate(-8deg)}100%{opacity:0}}
EOF
fi
