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
      'Email not confirmed. In Supabase → Authentication → Providers → Email, turn OFF "Confirm email", then try again.'
    );
  }
  return err;
}

function roleFromUser(user: User | null): AccountRole {
  const r = (user?.user_metadata?.role as string | undefined) || 'agent';
  return r === 'customer' ? 'customer' : 'agent';
}

/** Only hard-block rejected agents. Pending/missing must not lock admins out. */
async function assertAgentAllowed(user: User): Promise<void> {
  if (!supabase) return;
  if (roleFromUser(user) !== 'agent') return;

  const email = (user.email || '').trim().toLowerCase();
  const meta = (user.user_metadata?.approval_status as string | undefined) || '';

  try {
    let row: { approval_status?: string | null; is_admin?: boolean } | null = null;

    const { data: byId } = await supabase
      .from('agents')
      .select('approval_status, is_admin')
      .eq('user_id', user.id)
      .maybeSingle();
    if (byId) row = byId;

    if (!row && email) {
      const { data: byEmail } = await supabase
        .from('agents')
        .select('approval_status, is_admin')
        .ilike('email', email)
        .limit(1)
        .maybeSingle();
      if (byEmail) row = byEmail;
    }

    if (row?.is_admin) return;

    const approval = row?.approval_status ?? meta;
    if (approval === 'rejected') {
      await supabase.auth.signOut();
      throw new Error(
        'This agent account was rejected by an administrator. Contact support if you need access.'
      );
    }
  } catch (e) {
    if (e instanceof Error && /rejected/i.test(e.message)) throw e;
  }
}

/** Only hard-block rejected customers. Pending does not block portal sign-in. */
async function assertCustomerAllowed(user: User): Promise<void> {
  if (!supabase) return;
  if (roleFromUser(user) !== 'customer') return;

  const email = (user.email || '').trim().toLowerCase();
  if (!email) return;

  try {
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

    if (status === 'rejected') {
      await supabase.auth.signOut();
      throw new Error(
        'This customer account was rejected by an administrator. Contact support if you need access.'
      );
    }
  } catch (e) {
    if (e instanceof Error && /rejected/i.test(e.message)) throw e;
  }
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
        const u = data.session?.user;
        if (u && roleFromUser(u) === 'customer') {
          try {
            await assertCustomerAllowed(u);
            if (!cancelled) setSession(data.session);
          } catch {
            if (!cancelled) setSession(null);
          }
        } else if (u && roleFromUser(u) === 'agent') {
          try {
            await assertAgentAllowed(u);
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw friendlyAuthError(error);
    if (data.user) {
      if (roleFromUser(data.user) === 'customer') await assertCustomerAllowed(data.user);
      else await assertAgentAllowed(data.user);
    }
    if (data.session) setSession(data.session);
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
          approval_status: 'pending',
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
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      const { error: cErr } = await supabase.from('customers').upsert(row, { onConflict: 'id' });
      if (cErr) {
        const { data: existing } = await supabase
          .from('customers')
          .select('id')
          .ilike('email', normalizedEmail)
          .maybeSingle();
        if (existing?.id) {
          await supabase
            .from('customers')
            .update({ status: 'pending', name: displayName })
            .eq('id', existing.id);
        } else {
          await supabase.from('customers').insert({
            name: displayName,
            email: normalizedEmail,
            role: 'Customer',
            status: 'pending',
          });
        }
      }
      if (data.session) setSession(data.session);
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
      const { error: aErr } = await supabase
        .from('agents')
        .insert({ ...base, approval_status: 'pending' });
      if (aErr) {
        const { error: aErr2 } = await supabase.from('agents').insert(base);
        if (aErr2) console.warn('Agent insert failed', aErr2.message);
      }
      if (data.session) setSession(data.session);
      return;
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
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
