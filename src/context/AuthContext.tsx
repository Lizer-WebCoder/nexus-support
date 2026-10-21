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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const configError = getSupabaseConfigError();

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error(configError || 'Supabase is not configured');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw friendlyAuthError(error);
  };

  const signUp = async (
    email: string,
    password: string,
    fullName?: string,
    role: AccountRole = 'agent'
  ) => {
    if (!supabase) throw new Error(configError || 'Supabase is not configured');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email.split('@')[0],
          role,
        },
      },
    });
    if (error) throw friendlyAuthError(error);

    // Queue customer for admin approval in the Users page
    if (role === 'customer') {
      const displayName = fullName || email.split('@')[0];
      const row = {
        id: data.user?.id || crypto.randomUUID(),
        name: displayName,
        email: email.trim().toLowerCase(),
        role: 'Customer',
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      const { error: cErr } = await supabase.from('customers').upsert(row, { onConflict: 'id' });
      if (cErr) {
        const { error: cErr2 } = await supabase.from('customers').insert({
          name: displayName,
          email: email.trim().toLowerCase(),
          role: 'Customer',
        });
        if (cErr2) console.warn('Could not queue customer for approval', cErr2.message);
      }
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
