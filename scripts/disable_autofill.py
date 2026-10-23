#!/usr/bin/env python3
"""Block passive browser autofill on login; allow password manager on focus/click."""
from pathlib import Path

p = Path("src/components/LoginPage.tsx")
t = p.read_text()
if len(t) < 500:
    raise SystemExit("LoginPage empty")

t = t.replace(
    '<form onSubmit={submit} className="space-y-4">',
    '<form onSubmit={submit} className="space-y-4" autoComplete="off">',
)
t = t.replace(
    '<form onSubmit={submit} className="space-y-3.5">',
    '<form onSubmit={submit} className="space-y-3.5" autoComplete="off">',
)

old_email_signin = (
    '<input type="email" required className="login-glass-input w-full rounded-xl px-3 py-2.5 text-sm outline-none" '
    'value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" />'
)
new_email_signin = (
    '<input type="email" required className="login-glass-input w-full rounded-xl px-3 py-2.5 text-sm outline-none" '
    'value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" '
    'autoComplete="username" name="nexus-email" readOnly onFocus={(e) => { e.currentTarget.readOnly = false; }} />'
)
if old_email_signin in t:
    t = t.replace(old_email_signin, new_email_signin, 1)
    print("signin email patched")
else:
    print("WARN signin email not found")

old_pw_signin = (
    "<input type={showPassword ? 'text' : 'password'} required minLength={6} className=\"login-glass-input w-full rounded-xl px-3 py-2.5 text-sm outline-none pr-12\" "
    'value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />'
)
new_pw_signin = (
    "<input type={showPassword ? 'text' : 'password'} required minLength={6} className=\"login-glass-input w-full rounded-xl px-3 py-2.5 text-sm outline-none pr-12\" "
    'value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" '
    'autoComplete="current-password" name="nexus-password" readOnly onFocus={(e) => { e.currentTarget.readOnly = false; }} />'
)
if old_pw_signin in t:
    t = t.replace(old_pw_signin, new_pw_signin, 1)
    print("signin password patched")
else:
    print("WARN signin password not found")

old_email_reg = (
    '<input type="email" required className="login-glass-input w-full rounded-xl px-3 py-2.5 text-sm outline-none" '
    'value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" />'
)
new_email_reg = (
    '<input type="email" required className="login-glass-input w-full rounded-xl px-3 py-2.5 text-sm outline-none" '
    'value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" '
    'autoComplete="off" name="nexus-reg-email" readOnly onFocus={(e) => { e.currentTarget.readOnly = false; }} />'
)
if old_email_reg in t:
    t = t.replace(old_email_reg, new_email_reg)
    print("reg email patched")

t = t.replace(
    'placeholder="At least 6 characters" autoComplete="new-password" />',
    'placeholder="At least 6 characters" autoComplete="new-password" name="nexus-reg-password" readOnly onFocus={(e) => { e.currentTarget.readOnly = false; }} />',
)
t = t.replace(
    'placeholder="Re-enter password" autoComplete="new-password" />',
    'placeholder="Re-enter password" autoComplete="new-password" name="nexus-reg-confirm" readOnly onFocus={(e) => { e.currentTarget.readOnly = false; }} />',
)
print("reg passwords patched if present")

p.write_text(t)
print("done", len(t), t.count("readOnly"))
