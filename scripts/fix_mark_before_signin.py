#!/usr/bin/env python3
from pathlib import Path
lp = Path('src/components/LoginPage.tsx')
t = lp.read_text()
old = """      if (mode === 'signin') {
        await signIn(email.trim(), password, isAgent ? 'agent' : 'customer');
        markJustLoggedIn();
        window.location.hash = isAgent ? '' : 'portal';
      }"""
new = """      if (mode === 'signin') {
        markJustLoggedIn();
        await signIn(email.trim(), password, isAgent ? 'agent' : 'customer');
        window.location.hash = isAgent ? '' : 'portal';
      }"""
if old in t:
    t = t.replace(old, new)
    print('mark before signIn')
elif 'markJustLoggedIn();\n        await signIn' in t:
    print('already before')
else:
    raise SystemExit('block not found')
if 'markJustLoggedIn' not in t:
    t = t.replace(
        "import { useAuth } from '../context/AuthContext';",
        "import { useAuth } from '../context/AuthContext';\nimport { markJustLoggedIn } from './PostLoginLoader';",
    )
lp.write_text(t)
print('done')
