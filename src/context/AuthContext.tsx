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
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string, role?: AccountRole) => Promise<void>;
  signOut: () => Promise<void>;
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
      'Confirm your email in the inbox before signing in (or disable Confirm email in Supabase Auth settings).'
    );
  }
  return err;
}

function roleFromUser(user: User | null): AccountRole {
  const r = (user?.user_metadata?.role as string | undefined) || 'agent';
  return r === 'customer' ? 'customer' : 'agent';
}

async function assertAgentAllowed(user: User): Promise<void> {
  if (!supabase) return;
  if (roleFromUser(user) !== 'agent') return;

  const meta = (user.user_metadata?.approval_status as string | undefined) || '';
  const email = (user.email || '').trim().toLowerCase();

  let approval: string | null | undefined = undefined;
  try {
    const { data: byId } = await supabase
      .from('agents')
      .select('approval_status')
      .eq('user_id', user.id)
      .maybeSingle();
    if (byId && byId.approval_status !== undefined) {
      approval = byId.approval_status as string | null;
    }
  } catch {
    /* column may not exist */
  }
  if (approval === undefined && email) {
    try {
      const { data: byEmail } = await supabase
        .from('agents')
        .select('approval_status')
        .ilike('email', email)
        .limit(1)
        .maybeSingle();
      if (byEmail && byEmail.approval_status !== undefined) {
        approval = byEmail.approval_status as string | null;
      }
    } catch {
      /* ignore */
    }
  }

  if (approval === undefined || approval === null || approval === '') {
    if (meta === 'pending') {
      await supabase.auth.signOut();
      throw new Error(
        'Your agent account is pending admin approval. An administrator must approve it under Users → Pending before you can sign in.'
      );
    }
    if (meta === 'rejected') {
      await supabase.auth.signOut();
      throw new Error('This agent account was rejected by an administrator. Contact support if you need access.');
    }
    return;
  }

  if (approval === 'approved') return;

  await supabase.auth.signOut();
  if (approval === 'rejected') {
    throw new Error('This agent account was rejected by an administrator. Contact support if you need access.');
  }
  throw new Error(
    'Your agent account is pending admin approval. An administrator must approve it under Users → Pending before you can sign in.'
  );
}

async function assertCustomerAllowed(user: User): Promise<void> {
  if (!supabase) return;
  if (roleFromUser(user) !== 'customer') return;

  const email = (user.email || '').trim().toLowerCase();
  if (!email) {
    await supabase.auth.signOut();
    throw new Error('Customer account has no email.');
  }

  let status: string | null = null;
  const { data: byId } = await supabase
    .from('customers')
    .select('status')
    .eq('id', user.id)
    .maybeSingle();
  if (byId?.status) status = byId.status;

  if (!status) {
    const { data: byEmail } = await supabase
      .from('customers')
      .select('status')
      .ilike('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (byEmail?.status) status = byEmail.status;
  }

  if (!status) {
    try {
      await supabase.from('customers').upsert({
        id: user.id,
        name: (user.user_metadata?.full_name as string) || email.split('@')[0],
        email,
        role: 'Customer',
        status: 'approved',
      }, { onConflict: 'id' });
    } catch {
      /* ignore */
    }
    return;
  }

  if (status === 'approved') return;

  await supabase.auth.signOut();

  if (status === 'rejected') {
    throw new Error(
      'This customer account was rejected by an administrator. Contact support if you need access.'
    );
  }
  throw new Error(
    'Your account is pending admin approval. Open Users → Pending as an admin and Approve this account, then try again.'
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const configError = getSupabaseConfigError();

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;
        if (data.session?.user && roleFromUser(data.session.user) === 'customer') {
          try {
            await assertCustomerAllowed(data.session.user);
            if (!cancelled) setSession(data.session);
          } catch {
            if (!cancelled) setSession(null);
          }
        } else if (data.session?.user && roleFromUser(data.session.user) === 'agent') {
          try {
            await assertAgentAllowed(data.session.user);
            if (!cancelled) setSession(data.session);
          } catch {
            if (!cancelled) setSession(null);
          }
        } else if (!cancelled) {
          setSession(data.session);
        }
      } catch {
        if (!cancelled) setSession(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (next?.user && roleFromUser(next.user) === 'customer') {
        void (async () => {
          try {
            await assertCustomerAllowed(next.user!);
            setSession(next);
          } catch {
            setSession(null);
          }
        })();
      } else if (next?.user && roleFromUser(next.user) === 'agent') {
        void (async () => {
          try {
            await assertAgentAllowed(next.user!);
            setSession(next);
          } catch {
            setSession(null);
          }
        })();
      } else {
        setSession(next);
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error(configError || 'Supabase is not configured');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw friendlyAuthError(error);
    if (data.user) {
      if (roleFromUser(data.user) === 'customer') await assertCustomerAllowed(data.user);
      else await assertAgentAllowed(data.user);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName?: string,
    role: AccountRole = 'agent'
  ) => {
    if (!supabase) throw new Error(configError || 'Supabase is not configured');
    const normalizedEmail = email.trim().toLowerCase();
    const displayName = fullName?.trim() || normalizedEmail.split('@')[0];

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: displayName,
          role,
          approval_status: role === 'agent' ? 'pending' : 'approved',
        },
      },
    });
    if (error) throw friendlyAuthError(error);

    if (role === 'customer') {
      const row = {
        id: data.user?.id || crypto.randomUUID(),
        name: displayName,
        email: normalizedEmail,
        role: 'Customer',
        status: 'approved',
        created_at: new Date().toISOString(),
      };

      const { error: cErr } = await supabase.from('customers').upsert(row, { onConflict: 'id' });
      if (cErr) {
        const { data: existing } = await supabase
          .from('customers')
          .select('id, status')
          .ilike('email', normalizedEmail)
          .maybeSingle();
        if (existing?.id) {
          await supabase
            .from('customers')
            .update({ status: 'approved', name: displayName })
            .eq('id', existing.id);
        } else {
          const { error: cErr2 } = await supabase.from('customers').insert({
            name: displayName,
            email: normalizedEmail,
            role: 'Customer',
            status: 'approved',
          });
          if (cErr2) console.warn('Could not create customer profile', cErr2.message);
        }
      }
      return;
    }

    if (role === 'agent') {
      const base = {
        user_id: data.user?.id || null,
        name: displayName,
        initials: displayName.slice(0, 2).toUpperCase(),
        role: 'Agent',
        status: 'offline',
        email: normalizedEmail,
        color: '#6366f1',
        is_admin: false,
      };
      const { error: aErr } = await supabase.from('agents').insert({ ...base, approval_status: 'pending' });
      if (aErr) {
        console.warn('Agent queue with approval_status failed', aErr.message);
        const { error: aErr2 } = await supabase.from('agents').insert(base);
        if (aErr2) console.warn('Agent insert fallback failed', aErr2.message);
      }
      await supabase.auth.signOut();
      throw new Error(
        'Account created. An administrator must approve it under Users → Pending before you can sign in to the Agent Workspace.'
      );
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const user = session?.user ?? null;

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
