#!/usr/bin/env python3
"""Customer tab first (left), Agent second; default load Customer."""
from pathlib import Path
import re

lp = Path("src/components/LoginPage.tsx")
t = lp.read_text()
if len(t) < 500:
    raise SystemExit("LoginPage empty")

old_state = "const [audienceTab, setAudienceTab] = useState<'agent' | 'customer'>(audience === 'agent' ? 'agent' : 'customer');"
new_state = "const [audienceTab, setAudienceTab] = useState<'agent' | 'customer'>('customer');"
if old_state in t:
    t = t.replace(old_state, new_state)
    print("default tab -> customer")
elif "useState<'agent' | 'customer'>('customer')" in t:
    print("default already customer")
else:
    print("WARN: audienceTab state not found")

pat = re.compile(
    r"(<button type=\"button\" onClick=\{\(\) => \{ setAudienceTab\('agent'\); setError\(''\); setInfo\(''\); \}\}\s*"
    r"className=\{`[^`]+`\}>Agent</button>)\s*"
    r"(<button type=\"button\" onClick=\{\(\) => \{ setAudienceTab\('customer'\); setError\(''\); setInfo\(''\); \}\}\s*"
    r"className=\{`[^`]+`\}>Customer</button>)",
    re.M,
)
m = pat.search(t)
if m:
    t = pat.sub(r"\2\n                \1", t)
    print("tabs swapped via regex")
else:
    a_start = t.find("setAudienceTab('agent')")
    c_start = t.find("setAudienceTab('customer')")
    if a_start < 0 or c_start < 0:
        raise SystemExit("tab clicks not found")
    a_btn = t.rfind("<button", 0, a_start)
    c_btn = t.rfind("<button", 0, c_start)
    a_end = t.find("</button>", a_start) + len("</button>")
    c_end = t.find("</button>", c_start) + len("</button>")
    if a_btn < c_btn:
        agent_block = t[a_btn:a_end]
        customer_block = t[c_btn:c_end]
        between = t[a_end:c_btn]
        t = t[:a_btn] + customer_block + between + agent_block + t[c_end:]
        print("tabs swapped via positions")
    else:
        print("Customer already before Agent")

lp.write_text(t)
print("LoginPage", len(t))
print("first tab click:", "customer" if t.find("setAudienceTab('customer')") < t.find("setAudienceTab('agent')") else "agent")

app = Path("src/App.tsx")
at = app.read_text()
if 'audience="agent"' in at:
    at = at.replace('audience="agent"', 'audience="customer"')
    app.write_text(at)
    print("App LoginPage audience -> customer")
elif 'audience="customer"' in at:
    print("App already customer")
else:
    print("WARN: audience prop not found in App")
