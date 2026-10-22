#!/usr/bin/env python3
from pathlib import Path
p = Path("src/context/AuthContext.tsx")
t = p.read_text()
if "resetPassword" in t and p.stat().st_size > 5000:
    print("resetPassword already present")
    raise SystemExit(0)
if "signOut: () => Promise<void>;" in t and "resetPassword" not in t:
    t = t.replace(
        "  signOut: () => Promise<void>;\n}",
        "  signOut: () => Promise<void>;\n  resetPassword: (email: string) => Promise<void>;\n}",
    )
insert = """
  const resetPassword = async (email: string) => {
    if (!supabase) throw new Error(configError || 'Supabase is not configured');
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), redirectTo ? { redirectTo } : undefined);
    if (error) throw friendlyAuthError(error);
  };

"""
if "const resetPassword" not in t and "const signOut = async" in t:
    t = t.replace("  const signOut = async", insert + "  const signOut = async")
if "        signOut," in t and "resetPassword," not in t:
    t = t.replace("        signOut,", "        signOut,\n        resetPassword,")
p.write_text(t)
print("AuthContext patched", p.stat().st_size)
