#!/usr/bin/env python3
"""Fully discourage browser autofill / saved-account prompts on login + registration."""
from pathlib import Path

p = Path("src/components/LoginPage.tsx")
t = p.read_text()
if len(t) < 500:
    raise SystemExit("LoginPage empty")

EMAIL_ATTRS = (
    'autoComplete="off" '
    'autoCapitalize="none" '
    'autoCorrect="off" '
    'spellCheck={false} '
    'name="nexus_email_manual" '
    'data-lpignore="true" '
    'data-1p-ignore="true" '
    'data-bwignore="true" '
    'data-form-type="other"'
)
PASS_ATTRS = (
    'autoComplete="new-password" '
    'name="nexus_password_manual" '
    'data-lpignore="true" '
    'data-1p-ignore="true" '
    'data-bwignore="true" '
    'data-form-type="other"'
)

old_email_in = (
    '<input type="email" required className="login-glass-input w-full rounded-xl px-3 py-2.5 text-sm outline-none" '
    'value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" '
    'autoComplete="username" name="nexus-email" readOnly onFocus={(e) => { e.currentTarget.readOnly = false; }} />'
)
new_email_in = (
    '<input type="email" required className="login-glass-input w-full rounded-xl px-3 py-2.5 text-sm outline-none" '
    f'value={{email}} onChange={{(e) => setEmail(e.target.value)}} placeholder="you@company.com" {EMAIL_ATTRS} />'
)
if old_email_in in t:
    t = t.replace(old_email_in, new_email_in, 1)
    print("signin email hard-off")
else:
    print("WARN signin email pattern")

old_pw_in = (
    "<input type={showPassword ? 'text' : 'password'} required minLength={6} "
    'className="login-glass-input w-full rounded-xl px-3 py-2.5 text-sm outline-none pr-12" '
    'value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" '
    'autoComplete="current-password" name="nexus-password" readOnly onFocus={(e) => { e.currentTarget.readOnly = false; }} />'
)
new_pw_in = (
    "<input type={showPassword ? 'text' : 'password'} required minLength={6} "
    'className="login-glass-input w-full rounded-xl px-3 py-2.5 text-sm outline-none pr-12" '
    f'value={{password}} onChange={{(e) => setPassword(e.target.value)}} placeholder="••••••••" {PASS_ATTRS} />'
)
if old_pw_in in t:
    t = t.replace(old_pw_in, new_pw_in, 1)
    print("signin password hard-off")
else:
    print("WARN signin password pattern")

old_email_reg = (
    '<input type="email" required className="login-glass-input w-full rounded-xl px-3 py-2.5 text-sm outline-none" '
    'value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" '
    'autoComplete="off" name="nexus-reg-email" readOnly onFocus={(e) => { e.currentTarget.readOnly = false; }} />'
)
new_email_reg = (
    '<input type="email" required className="login-glass-input w-full rounded-xl px-3 py-2.5 text-sm outline-none" '
    f'value={{email}} onChange={{(e) => setEmail(e.target.value)}} placeholder="you@company.com" {EMAIL_ATTRS} />'
)
if old_email_reg in t:
    t = t.replace(old_email_reg, new_email_reg)
    print("reg email hard-off")

old_reg_pw = (
    'placeholder="At least 6 characters" autoComplete="new-password" name="nexus-reg-password" '
    'readOnly onFocus={(e) => { e.currentTarget.readOnly = false; }} />'
)
new_reg_pw = f'placeholder="At least 6 characters" {PASS_ATTRS} />'
if old_reg_pw in t:
    t = t.replace(old_reg_pw, new_reg_pw)
    print("reg password hard-off")

old_reg_cf = (
    'placeholder="Re-enter password" autoComplete="new-password" name="nexus-reg-confirm" '
    'readOnly onFocus={(e) => { e.currentTarget.readOnly = false; }} />'
)
new_reg_cf = (
    'placeholder="Re-enter password" autoComplete="new-password" name="nexus_confirm_manual" '
    'data-lpignore="true" data-1p-ignore="true" data-bwignore="true" data-form-type="other" />'
)
if old_reg_cf in t:
    t = t.replace(old_reg_cf, new_reg_cf)
    print("reg confirm hard-off")

t = t.replace(
    'placeholder="Jane Doe" autoComplete="name" />',
    'placeholder="Jane Doe" autoComplete="off" name="nexus_name_manual" data-lpignore="true" data-1p-ignore="true" data-form-type="other" />',
)

p.write_text(t)
print("done", len(t))
print("current-password left", "current-password" in t)
print("username left", 'autoComplete="username"' in t)
print("readOnly onFocus left", "readOnly onFocus" in t)
