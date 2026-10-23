#!/usr/bin/env python3
"""Wire PostLoginLoader into App.tsx + LoginPage post-sign-in hash."""
from pathlib import Path

app_path = Path("src/App.tsx")
app = app_path.read_text()

if "PostLoginLoader" not in app:
    app = app.replace(
        "import PortalAuthGate from './components/PortalAuthGate';",
        "import PortalAuthGate from './components/PortalAuthGate';\nimport PostLoginLoader from './components/PostLoginLoader';",
    )

old1 = '''  if (requiresAuth && authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 text-zinc-500 text-sm">
        Loading workspace…
      </div>
    );
  }'''
new1 = '''  if (requiresAuth && authLoading) {
    return <PostLoginLoader label="Loading workspace…" subtitle="Checking your session and desk access." />;
  }'''
if old1 in app:
    app = app.replace(old1, new1)
    print("agent auth loading -> PostLoginLoader")
elif "Loading workspace" in app and "PostLoginLoader label=\"Loading workspace" in app:
    print("agent auth loading already patched")
else:
    print("WARN: agent auth loading block")

old2 = '''  if (requiresAuth && user && accountRole === 'customer') {
    if (!window.location.hash.toLowerCase().includes('portal')) {
      window.location.hash = 'portal';
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 text-zinc-500 text-sm">
        Opening customer portal…
      </div>
    );
  }'''
new2 = '''  if (requiresAuth && user && accountRole === 'customer') {
    if (!window.location.hash.toLowerCase().includes('portal')) {
      window.location.hash = 'portal';
    }
    return (
      <PostLoginLoader
        label="Opening customer portal…"
        subtitle="Taking you to your tickets and live chat."
      />
    );
  }'''
if old2 in app:
    app = app.replace(old2, new2)
    print("customer redirect -> PostLoginLoader")
elif "Opening customer portal" in app and "PostLoginLoader" in app:
    print("customer redirect already patched")
else:
    print("WARN: customer redirect block")

app_path.write_text(app)
print("App.tsx", len(app))

lp_path = Path("src/components/LoginPage.tsx")
t = lp_path.read_text()
old = """      if (mode === 'signin') await signIn(email.trim(), password, isAgent ? 'agent' : 'customer');
      else {
        await signUp(email.trim(), password, name.trim() || undefined, isAgent ? 'agent' : 'customer');
        setInfo('Account created. You can sign in now.');
        setMode('signin');
      }"""
new = """      if (mode === 'signin') {
        await signIn(email.trim(), password, isAgent ? 'agent' : 'customer');
        window.location.hash = isAgent ? '' : 'portal';
      } else {
        await signUp(email.trim(), password, name.trim() || undefined, isAgent ? 'agent' : 'customer');
        setInfo('Account created. You can sign in now.');
        setMode('signin');
      }"""
if old in t:
    t = t.replace(old, new)
    lp_path.write_text(t)
    print("LoginPage post-signin hash")
elif "window.location.hash = isAgent" in t:
    print("LoginPage already routes")
else:
    print("WARN: LoginPage submit block")
print("LoginPage", len(lp_path.read_text()))
