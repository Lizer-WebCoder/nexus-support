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

/**
 * Derive role from database tables (source of truth), not user_metadata.
 * Falls back to metadata only when tables are unreachable.
 */
async function resolveRoleFromDb(user: User): Promise<AccountRole> {
  if (!supabase) {
    const r = (user.user_metadata?.role as string | undefined) || 'agent';
    return r === 'customer' ? 'customer' : 'agent';
  }

  try {
    const { data: agent } = await supabase
      .from('agents')
      .select('approval_status, is_admin')
      .eq('user_id', user.id)
      .maybeSingle();

    if (agent) {
      if (agent.is_admin && agent.approval_status === 'approved') return 'admin';
      if (agent.approval_status === 'approved') return 'agent';
      return 'agent';
    }

    if (user.email) {
      const { data: byEmail } = await supabase
        .from('agents')
        .select('approval_status, is_admin')
        .eq('email', user.email)
        .maybeSingle();
      if (byEmail) {
        if (byEmail.is_admin && byEmail.approval_status === 'approved') return 'admin';
        if (byEmail.approval_status === 'approved') return 'agent';
        return 'agent';
      }
    }
  } catch {
    /* table may not exist yet */
  }

  try {
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (customer) return 'customer';

    if (user.email) {
      const { data: byEmail } = await supabase
        .from('customers')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();
      if (byEmail) return 'customer';
    }
  } catch {
    /* ignore */
  }

  const meta = (user.user_metadata?.role as string | undefined) || 'agent';
  return meta === 'customer' ? 'customer' : 'agent';
}

async function enforceAgentApproval(user: User): Promise<void> {
  if (!supabase) return;

  let row: { approval_status?: string | null; is_admin?: boolean } | null = null;
  try {
    const { data } = await supabase
      .from('agents')
      .select('approval_status, is_admin')
      .eq('user_id', user.id)
      .maybeSingle();
    row = data;

    if (!row && user.email) {
      const { data: byEmail } = await supabase
        .from('agents')
        .select('approval_status, is_admin')
        .eq('email', user.email)
        .maybeSingle();
      row = byEmail;
    }
  } catch {
    /* column may not exist yet */
  }

  if (!row) {
    await supabase.auth.signOut();
    throw new Error(
      'Your agent account is pending admin approval. An administrator must approve it under Users → Pending before you can sign in.'
    );
  }

  if (row.is_admin) return;
  const approval = row.approval_status || 'pending';

  if (approval === 'approved') return;

  if (approval === 'rejected') {
    await supabase.auth.signOut();
    throw new Error('Your agent account was rejected. Contact an administrator.');
  }

  await supabase.auth.signOut();
  throw new Error(
    'Your agent account is pending admin approval. An administrator must approve it under Users → Pending before you can sign in.'
  );
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
        const role = await resolveRoleFromDb(next.user);
        if (!cancelled) setAccountRole(role);
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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw friendlyAuthError(error);

    const role = await resolveRoleFromDb(data.user!);
    setAccountRole(role);

    if (expectedRole) {
      const normalized = role === 'admin' ? 'agent' : role;
      if (normalized !== expectedRole) {
        await supabase.auth.signOut();
        throw new Error(
          expectedRole === 'agent'
            ? 'This account is registered as a customer. Use the Customer tab to sign in.'
            : 'This account is registered as an agent. Use the Agent tab to sign in.'
        );
      }
    }

    if (role === 'agent' || role === 'admin') {
      await enforceAgentApproval(data.user!);
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
      email,
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
            approval_status: 'pending',
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
    }

    if (data.session) {
      await supabase.auth.signOut();
    }

    if (role === 'agent') {
      throw new Error(
        'Account created. An admin must approve your agent account before you can sign in.'
      );
    }
    throw new Error('Account created. You can sign in now.');
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
