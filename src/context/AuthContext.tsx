import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, getSupabaseConfigError } from '../lib/supabase';

export type AccountRole = 'agent' | 'customer';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  requiresAuth: boolean;
  configError: string | null;
  accountRole: AccountRole;
  signIn: (email: string, password: string, expectedRole?: AccountRole) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string, role?: AccountRole) => Promise<void>;
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

function roleFromUser(user: User | null): AccountRole {
  const r = (user?.user_metadata?.role as string | undefined) || 'agent';
  return r === 'customer' ? 'customer' : 'agent';
}

async function enforceAgentApproval(user: User): Promise<void> {
  if (!supabase) return;
  const meta = (user.user_metadata?.approval_status as string | undefined) || '';
  if (meta === 'approved') return;

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

  const approval = (row?.approval_status ?? meta) || '';
  if (!approval || approval === 'approved') return;
  if (row?.is_admin) return;

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
  const configError = getSupabaseConfigError();

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setUser(next?.user ?? null);
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string, expectedRole?: AccountRole) => {
    if (!supabase) throw new Error(configError || 'Supabase is not configured');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw friendlyAuthError(error);
    const role = roleFromUser(data.user);
    if (expectedRole && role !== expectedRole) {
      await supabase.auth.signOut();
      throw new Error(
        expectedRole === 'agent'
          ? 'This account is registered as a customer. Use the Customer tab to sign in.'
          : 'This account is registered as an agent. Use the Agent tab to sign in.'
      );
    }
    if (role === 'agent' && data.user) {
      await enforceAgentApproval(data.user);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName?: string,
    role: AccountRole = 'customer'
  ) => {
    if (!supabase) throw new Error(configError || 'Supabase is not configured');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
          role,
          approval_status: 'pending',
        },
      },
    });
    if (error) throw friendlyAuthError(error);
    if (data.session) {
      await supabase.auth.signOut();
    }
    throw new Error(
      'Account created. An admin must approve your account before you can sign in.'
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
        accountRole: roleFromUser(user),
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
