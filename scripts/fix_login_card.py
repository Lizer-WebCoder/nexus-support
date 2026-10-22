#!/usr/bin/env python3
"""Move card subtitle under Nexus Ops title; add Forgot Password on Customer tab."""
from pathlib import Path
import re

# --- AuthContext: add resetPassword ---
auth = Path("src/context/AuthContext.tsx")
if auth.exists() and auth.stat().st_size > 500:
    at = auth.read_text()
    if "resetPassword" not in at:
        at = at.replace(
            "  signOut: () => Promise<void>;\n}",
            "  signOut: () => Promise<void>;\n"
            "  resetPassword: (email: string) => Promise<void>;\n}",
        )
        if "const signOut = async" in at and "const resetPassword" not in at:
            insert = '''
  const resetPassword = async (email: string) => {
    if (!supabase) throw new Error(configError || 'Supabase is not configured');
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), redirectTo ? { redirectTo } : undefined);
    if (error) throw friendlyAuthError(error);
  };

'''
            at = at.replace("  const signOut = async", insert + "  const signOut = async")
        if "signOut," in at and "resetPassword," not in at:
            at = at.replace("        signOut,", "        signOut,\n        resetPassword,")
        auth.write_text(at)
        print("AuthContext: resetPassword added")
    else:
        print("AuthContext: resetPassword already present")

# --- LoginPage UI ---
p = Path("src/components/LoginPage.tsx")
if not p.exists() or p.stat().st_size < 1000:
    raise SystemExit("LoginPage.tsx missing or empty")

t = p.read_text()

t = t.replace(
    "const { signIn, signUp, configError } = useAuth();",
    "const { signIn, signUp, resetPassword, configError } = useAuth();",
)

old_header = '''              <div className="flex flex-col items-center mb-5">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-3">
                  <NexusLogoMark size={28} />
                </div>
                <div className="text-lg font-semibold text-white tracking-tight">Nexus Ops</div>
              </div>'''

new_header = '''              <div className="flex flex-col items-center mb-5">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-3">
                  <NexusLogoMark size={28} />
                </div>
                <div className="text-lg font-semibold text-white tracking-tight">Nexus Ops</div>
                <p className="mt-1.5 text-xs text-fuchsia-200/75 text-center">{cardSub}</p>
              </div>'''

if old_header in t:
    t = t.replace(old_header, new_header)
    print("header: cardSub moved under title")
elif 'tracking-tight">Nexus Ops</div>\n              </div>' in t and "{cardSub}</p>" not in t.split("Nexus Ops</div>")[1][:120]:
    t = t.replace(
        'tracking-tight">Nexus Ops</div>\n              </div>',
        'tracking-tight">Nexus Ops</div>\n                <p className="mt-1.5 text-xs text-fuchsia-200/75 text-center">{cardSub}</p>\n              </div>',
        1,
    )
    print("header: cardSub inserted (soft)")
else:
    print("header: already updated or pattern differs")

bottom = '                <p className="text-center text-xs text-fuchsia-200/75">{cardSub}</p>'
if bottom in t:
    t = t.replace(bottom, "")
    print("removed bottom cardSub")

old_create = '''                {mode === 'signin' ? (
                  <p className="text-center text-xs text-fuchsia-200/70">
                    New here?{' '}
                    <button type="button" onClick={() => { setMode('signup'); setError(''); setInfo(''); }} className="text-fuchsia-100 hover:text-white font-semibold underline-offset-2 hover:underline">Create an account</button>
                  </p>
                ) : (
                  <p className="text-center text-xs text-fuchsia-200/70">
                    Already registered?{' '}
                    <button type="button" onClick={() => { setMode('signin'); setError(''); setInfo(''); }} className="text-fuchsia-100 hover:text-white font-semibold underline-offset-2 hover:underline">Sign in</button>
                  </p>
                )}'''

new_create = '''                {mode === 'signin' ? (
                  <div className="space-y-2">
                    <p className="text-center text-xs text-fuchsia-200/70">
                      New here?{' '}
                      <button type="button" onClick={() => { setMode('signup'); setError(''); setInfo(''); }} className="text-fuchsia-100 hover:text-white font-semibold underline-offset-2 hover:underline">Create an account</button>
                    </p>
                    {!isAgent && (
                      <p className="text-center text-xs text-fuchsia-200/70">
                        <button
                          type="button"
                          className="text-fuchsia-100/90 hover:text-white font-medium underline-offset-2 hover:underline"
                          onClick={async () => {
                            setError('');
                            setInfo('');
                            const em = email.trim();
                            if (!em) {
                              setError('Enter your email above, then click Forgot Password?');
                              return;
                            }
                            setLoading(true);
                            try {
                              await resetPassword(em);
                              setInfo('Password reset email sent. Check your inbox (and spam folder).');
                            } catch (err: unknown) {
                              setError(err instanceof Error ? err.message : 'Could not send reset email');
                            } finally {
                              setLoading(false);
                            }
                          }}
                        >
                          Forgot Password?
                        </button>
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-xs text-fuchsia-200/70">
                    Already registered?{' '}
                    <button type="button" onClick={() => { setMode('signin'); setError(''); setInfo(''); }} className="text-fuchsia-100 hover:text-white font-semibold underline-offset-2 hover:underline">Sign in</button>
                  </p>
                )}'''

if old_create in t:
    t = t.replace(old_create, new_create)
    print("Forgot Password link added (Customer sign-in)")
elif "Forgot Password?" in t:
    print("Forgot Password already present")
else:
    print("create-account block pattern not found")

p.write_text(t)
print("ok", len(t))
