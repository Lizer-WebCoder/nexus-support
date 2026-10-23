#!/usr/bin/env python3
"""Remove Agent/Customer switcher from registration card; keep text links only."""
from pathlib import Path
import re

p = Path("src/components/LoginPage.tsx")
t = p.read_text()
if len(t) < 500:
    raise SystemExit("LoginPage empty")

old = '''                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => { setAudienceTab('agent'); setError(''); }}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition ${isAgent ? 'bg-violet-500/25 border-violet-400/50 text-white' : 'border-white/10 text-fuchsia-200/60 hover:text-white'}`}>Agent</button>
                  <button type="button" onClick={() => { setAudienceTab('customer'); setError(''); }}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition ${!isAgent ? 'bg-fuchsia-500/25 border-fuchsia-400/50 text-white' : 'border-white/10 text-fuchsia-200/60 hover:text-white'}`}>Customer</button>
                </div>
'''

if old in t:
    t = t.replace(old, '')
    print("removed reg role switcher")
else:
    pat = re.compile(
        r"\s*<div className=\"flex gap-2 pt-1\">\s*"
        r"<button type=\"button\" onClick=\{\(\) => \{ setAudienceTab\('agent'\); setError\(''\); \}\}[\s\S]*?>Agent</button>\s*"
        r"<button type=\"button\" onClick=\{\(\) => \{ setAudienceTab\('customer'\); setError\(''\); \}\}[\s\S]*?>Customer</button>\s*"
        r"</div>\s*",
        re.M,
    )
    if pat.search(t):
        t = pat.sub("\n", t)
        print("removed via regex")
    else:
        print("WARN: switcher not found")

if "Create an account</button>" in t and "Create an agent account" not in t:
    t = t.replace(
        ">Create an account</button>",
        ">{isAgent ? 'Create an agent account' : 'Create a customer account'}</button>",
        1,
    )
    print("create link role-aware")

if "Already have an account?" in t and "Back to customer sign in" not in t:
    t = t.replace(
        ">Sign in</button>",
        ">{isAgent ? 'Back to agent sign in' : 'Back to customer sign in'}</button>",
        1,
    )
    print("signin back link role-aware")

p.write_text(t)
print("done", len(t))
