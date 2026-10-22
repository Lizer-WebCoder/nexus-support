#!/usr/bin/env python3
"""Apply separate registration card + visible Show + Forgot Password on LoginPage."""
from pathlib import Path
import re

p = Path("src/components/LoginPage.tsx")
t = p.read_text()
if t.strip() in ("PLACEHOLDER", "PLACEHOLDER_AUTH", "") or len(t) < 500:
    raise SystemExit("LoginPage empty")

if "confirmPassword" not in t:
    t = t.replace(
        "const [showPassword, setShowPassword] = useState(false);",
        "const [showPassword, setShowPassword] = useState(false);\n  const [showConfirm, setShowConfirm] = useState(false);\n  const [confirmPassword, setConfirmPassword] = useState('');",
    )

t = t.replace(
    "const { signIn, signUp, configError } = useAuth();",
    "const { signIn, signUp, resetPassword, configError } = useAuth();",
)

t = t.replace(
    'className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-fuchsia-200/60 hover:text-white px-2"',
    'className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-fuchsia-100 hover:text-white px-2 py-1 rounded-md hover:bg-white/10"',
)

if "Create your account" in t:
    print("already applied")
    p.write_text(t)
    raise SystemExit(0)

start = t.find('<div className="login-glass-card')
if start < 0:
    raise SystemExit("card not found")
end = t.find('</form>', start)
if end < 0:
    raise SystemExit("form end not found")
rest = t[end:]
m = re.search(r'</form>\s*</div>', rest)
if not m:
    raise SystemExit("card close not found")
end = end + m.end()

NEW = Path("scripts/registration_card_snippet.tsx").read_text()
t = t[:start] + NEW + t[end:]
t = t.replace('                <p className="text-center text-xs text-fuchsia-200/75">{cardSub}</p>\n', '')
p.write_text(t)
print("ok", len(t), "Create your account" in t)
