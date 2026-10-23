import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, getSupabaseConfigError } from '../lib/supabase';

export type AccountRole = 'agent' | 'customer' | 'admin';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  requiresAuth: boolean;
  configError: string | null;
  accountRole: AccountRole;
  signIn: (email: string, password: string, expectedRole?: 'agent' | 'customer') => Promise<void>;
  signUp: (
    email: string,
    password: string,
    fullName?: string,
    role?: 'agent' | 'customer'
  ) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function friendlyAuthError(err: unknown): Error {
  if (!(err instanceof Error)) return new Error('Authentication failed');
  const msg = err.message || '';
  const lower = msg.toLowerCase();

  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('load failed') ||
    lower.includes('err_name_not_resolved')
  ) {
    return new Error(
      'Cannot reach Supabase (Failed to fetch). Check that VITE_SUPABASE_URL is the full ' +
        'https://YOUR_PROJECT.supabase.co URL and that the project is not paused. ' +
        'Update GitHub Actions secrets and redeploy if this is the live site.'
    );
  }
  if (lower.includes('invalid login credentials')) {
    return new Error('Invalid email or password.');
  }
  if (lower.includes('user already registered')) {
    return new Error('An account with this email already exists. Sign in instead.');
  }
  if (lower.includes('email not confirmed')) {
    return new Error(
      'Email not confirmed. In Supabase → Authentication → Providers → Email, turn OFF "Confirm email", then try again.'
    );
  }
  return err;
}

function roleFromMetadata(user: User | null): AccountRole {
  const r = (user?.user_metadata?.role as string | undefined) || '';
  if (r === 'customer') return 'customer';
  if (r === 'admin') return 'admin';
  if (r === 'agent') return 'agent';
  // No metadata role → default agent (legacy accounts)
  return 'agent';
}

async function resolveRole(user: User): Promise<AccountRole> {
  const meta = roleFromMetadata(user);
  if (!supabase) return meta;

  try {
    const { data: agent } = await supabase
      .from('agents')
      .select('is_admin')
      .eq('user_id', user.id)
      .maybeSingle();
    if (agent) return agent.is_admin ? 'admin' : 'agent';

    if (user.email) {
      const { data: byEmail } = await supabase
        .from('agents')
        .select('is_admin')
        .eq('email', user.email)
        .maybeSingle();
      if (byEmail) return byEmail.is_admin ? 'admin' : 'agent';
    }
  } catch {
    /* ignore */
  }

  try {
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (customer) return 'customer';
  } catch {
    /* ignore */
  }

  return meta;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [accountRole, setAccountRole] = useState<AccountRole>('agent');
  const configError = getSupabaseConfigError();

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    const applySession = async (next: Session | null) => {
      if (cancelled) return;
      setSession(next);
      setUser(next?.user ?? null);
      if (next?.user) {
        // Set metadata role immediately so UI does not bounce
        setAccountRole(roleFromMetadata(next.user));
        try {
          const role = await resolveRole(next.user);
          if (!cancelled) setAccountRole(role);
        } catch {
          /* keep metadata role */
        }
      } else {
        setAccountRole('agent');
      }
      if (!cancelled) setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => {
      void applySession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      void applySession(next);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (
    email: string,
    password: string,
    expectedRole?: 'agent' | 'customer'
  ) => {
    if (!supabase) throw new Error(configError || 'Supabase is not configured');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw friendlyAuthError(error);
    if (!data.user) throw new Error('Authentication failed');

    // Immediate role from metadata so routing does not flash wrong shell
    let role = roleFromMetadata(data.user);
    setAccountRole(role);
    setUser(data.user);
    setSession(data.session);
    setLoading(false);

    try {
      role = await resolveRole(data.user);
      setAccountRole(role);
    } catch {
      /* keep metadata role */
    }

    // Soft role hint only — never sign the user out after a successful password auth
    if (expectedRole) {
      const normalized = role === 'admin' ? 'agent' : role;
      if (normalized !== expectedRole) {
        // Prefer expected tab role when metadata is missing/ambiguous
        if (!data.user.user_metadata?.role) {
          setAccountRole(expectedRole);
        }
        // Do not throw / signOut — let them into the app
      }
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName?: string,
    role: 'agent' | 'customer' = 'customer'
  ) => {
    if (!supabase) throw new Error(configError || 'Supabase is not configured');

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName || '',
          role,
        },
      },
    });
    if (error) throw friendlyAuthError(error);

    if (data.user) {
      try {
        if (role === 'agent') {
          await supabase.from('agents').upsert(
            {
              user_id: data.user.id,
              email: email.trim().toLowerCase(),
              name: fullName || email.split('@')[0],
              initials: (fullName || email)
                .split(/\s+/)
                .map((p) => p[0])
                .join('')
                .slice(0, 2)
                .toUpperCase(),
              role: 'Agent',
              status: 'offline',
              approval_status: 'approved',
              is_admin: false,
            },
            { onConflict: 'user_id' }
          );
        } else {
          await supabase.from('customers').upsert(
            {
              user_id: data.user.id,
              email: email.trim().toLowerCase(),
              name: fullName || email.split('@')[0],
              status: 'approved',
            },
            { onConflict: 'user_id' }
          );
        }
      } catch {
        /* optional */
      }
    }

    if (data.session) {
      await supabase.auth.signOut();
    }

    throw new Error(
      role === 'agent'
        ? 'Account created. You can sign in now.'
        : 'Account created. You can sign in now.'
    );
  };

  const resetPassword = async (email: string) => {
    if (!supabase) throw new Error(configError || 'Supabase is not configured');
    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}`
        : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      redirectTo ? { redirectTo } : undefined
    );
    if (error) throw friendlyAuthError(error);
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        requiresAuth: isSupabaseConfigured,
        configError,
        accountRole,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
