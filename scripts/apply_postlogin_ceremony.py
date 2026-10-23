#!/usr/bin/env python3
from pathlib import Path
import re

# LoginPage
lp = Path('src/components/LoginPage.tsx')
t = lp.read_text()
if 'markJustLoggedIn' not in t:
    t = t.replace(
        "import { useAuth } from '../context/AuthContext';",
        "import { useAuth } from '../context/AuthContext';\nimport { markJustLoggedIn } from './PostLoginLoader';",
    )
old = """      if (mode === 'signin') {
        await signIn(email.trim(), password, isAgent ? 'agent' : 'customer');
        window.location.hash = isAgent ? '' : 'portal';
      }"""
new = """      if (mode === 'signin') {
        await signIn(email.trim(), password, isAgent ? 'agent' : 'customer');
        markJustLoggedIn();
        window.location.hash = isAgent ? '' : 'portal';
      }"""
if old in t:
    t = t.replace(old, new)
    print('LoginPage markJustLoggedIn')
elif 'markJustLoggedIn()' in t:
    print('LoginPage already marked')
else:
    print('WARN LoginPage block')
lp.write_text(t)

# App
app = Path('src/App.tsx')
a = app.read_text()
a = a.replace(
    "import PostLoginLoader, { PostLoginShell } from './components/PostLoginLoader';",
    "import { PostLoginShell, BootLoader } from './components/PostLoginLoader';",
)
a = a.replace(
    "import PostLoginLoader, { PostLoginShell, BootLoader } from './components/PostLoginLoader';",
    "import { PostLoginShell, BootLoader } from './components/PostLoginLoader';",
)
a = a.replace(
    'return <PostLoginLoader label="Loading workspace…" subtitle="Checking your session and desk access." />;',
    'return <BootLoader label="Loading workspace…" />;',
)
a = re.sub(
    r'<PostLoginLoader\s+label="Opening customer portal…"\s+subtitle="Taking you to your tickets and live chat\."\s*/>',
    '<BootLoader label="Opening customer portal…" />',
    a,
)
if 'variant="agent"' not in a:
    a = a.replace(
        '''    <PostLoginShell
      ready={agentReady}
      label="Opening agent workspace…"
      subtitle="Loading your desk, tickets, and live chat."
    >''',
        '''    <PostLoginShell
      ready={agentReady}
      label="Opening agent workspace…"
      variant="agent"
    >''',
    )
app.write_text(a)
print('App BootLoader', 'BootLoader' in a, 'markJustLoggedIn' in t)
