#!/usr/bin/env python3
"""Restore LoginPage from pre-kirzhian-merge main (Lizer's UI),
and only wire markJustLoggedIn for post-login ceremony.
Keeps PostLoginLoader / App / PortalAuthGate as-is.
"""
import subprocess
from pathlib import Path

PRE_MERGE = 'a235a1fab0a0881910f1eea2fa70345b872b3503'
t = subprocess.check_output(
    ['git', 'show', f'{PRE_MERGE}:src/components/LoginPage.tsx'],
    text=True,
)

if "from './PostLoginLoader'" not in t and 'markJustLoggedIn' not in t:
    t = t.replace(
        "import { useAuth } from '../context/AuthContext';\nimport { SpaceFlybys } from './LoginFlybys';",
        "import { useAuth } from '../context/AuthContext';\nimport { markJustLoggedIn } from './PostLoginLoader';\nimport { SpaceFlybys } from './LoginFlybys';",
    )

old = "      if (mode === 'signin') await signIn(email.trim(), password, isAgent ? 'agent' : 'customer');"
new = """      if (mode === 'signin') {
        markJustLoggedIn();
        await signIn(email.trim(), password, isAgent ? 'agent' : 'customer');
        window.location.hash = isAgent ? '' : 'portal';
      }"""
if old in t:
    t = t.replace(old, new)
elif 'markJustLoggedIn()' not in t:
    raise SystemExit('could not patch signIn')

Path('src/components/LoginPage.tsx').write_text(t)
out = Path('src/components/LoginPage.tsx').read_text()
assert 'SpaceFlybys' in out
assert 'SpacePlanets' not in out
assert 'markJustLoggedIn' in out
print('restored Lizer LoginPage', len(out))
