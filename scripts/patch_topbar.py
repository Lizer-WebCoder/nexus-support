#!/usr/bin/env python3
from pathlib import Path
p = Path("src/components/CustomerPortal.tsx")
t = p.read_text()
if "VIEW_META" in t:
    print("already has VIEW_META")
    raise SystemExit(0)

old_titles = """const VIEW_TITLES: Record<PortalView, string> = {
  home: 'Home',
  submit: 'Submit a request',
  track: 'Track a ticket',
  success: 'Request received',
  help: 'Help articles',
  chat: 'Live chat',
  account: 'Account',
  mytickets: 'My tickets',
  community: 'Community',
};"""

new_titles = """const VIEW_META: Record<PortalView, { title: string; desc: string; iconColor: string }> = {
  home: { title: 'Home', desc: 'Self-serve help and quick actions for your account.', iconColor: 'text-violet-500' },
  submit: { title: 'Submit a request', desc: 'Open a support ticket with your branch and details.', iconColor: 'text-amber-500' },
  track: { title: 'Track a ticket', desc: 'Look up status updates by ticket ID and email.', iconColor: 'text-emerald-500' },
  success: { title: 'Request received', desc: 'Your ticket was created successfully.', iconColor: 'text-violet-500' },
  help: { title: 'Help articles', desc: 'Guides and FAQs you can use without waiting on an agent.', iconColor: 'text-indigo-500' },
  chat: { title: 'Live chat', desc: 'Talk to a support agent in real time.', iconColor: 'text-fuchsia-500' },
  account: { title: 'Account', desc: 'Profile details and sign-in information.', iconColor: 'text-pink-500' },
  mytickets: { title: 'My tickets', desc: 'Review tickets you have opened with support.', iconColor: 'text-blue-500' },
  community: { title: 'Community', desc: 'Chat with other customers about tips and workarounds.', iconColor: 'text-sky-500' },
};"""

if old_titles not in t:
    raise SystemExit("VIEW_TITLES block not found")
t = t.replace(old_titles, new_titles, 1)

old_header = """        <header className=\"relative z-20 h-12 shrink-0 nexus-topbar flex items-center gap-3 px-4 lg:px-6\">
          <div className=\"md:hidden\"><BrandMark className=\"w-8 h-8\" /></div>
          <div className=\"text-sm font-semibold text-zinc-800\">{VIEW_TITLES[view]}</div>
          <div className=\"flex-1\" />
          <div className=\"hidden sm:flex items-center gap-2 text-xs text-zinc-500\">
            <span className=\"w-1.5 h-1.5 rounded-full bg-emerald-500\" />
            Support online
          </div>
          <ThemeToggle />
        </header>"""

new_header = """        <header className=\"relative z-20 min-h-[3.75rem] shrink-0 nexus-topbar flex items-center gap-3 px-4 lg:px-6 py-2.5\">
          <div className=\"md:hidden shrink-0\"><BrandMark className=\"w-8 h-8\" /></div>
          {(() => {
            const meta = VIEW_META[view];
            const NavIcon = navItems.find((n) => n.id === view)?.icon
              ?? (view === 'success' ? CheckCircle2 : Home);
            return (
              <div className=\"flex items-center gap-3 min-w-0\">
                <div className={`w-10 h-10 rounded-xl bg-violet-500/10 dark:bg-violet-400/15 flex items-center justify-center shrink-0 ${meta.iconColor}`}>
                  <NavIcon size={20} strokeWidth={2.2} />
                </div>
                <div className=\"min-w-0\">
                  <div className=\"text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight truncate\">
                    {meta.title}
                  </div>
                  <div className=\"text-xs sm:text-[13px] text-zinc-500 dark:text-zinc-400 leading-snug truncate\">
                    {meta.desc}
                  </div>
                </div>
              </div>
            );
          })()}
          <div className=\"flex-1\" />
          <div className=\"hidden sm:flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400\">
            <span className=\"w-1.5 h-1.5 rounded-full bg-emerald-500\" />
            Support online
          </div>
          <ThemeToggle />
        </header>"""

if old_header not in t:
    raise SystemExit("header block not found")
t = t.replace(old_header, new_header, 1)
p.write_text(t)
print("topbar patched", "VIEW_META" in t)
