import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginPage from './LoginPage';
import PostLoginLoader, { PostLoginShell } from './PostLoginLoader';

interface Props {
  children: ReactNode;
  onOpenAgent?: () => void;
  /** @deprecated use onOpenAgent */
  onBackToAgent?: () => void;
}

/**
 * Customer portal gate: cosmic login until a customer session exists.
 * Agents are auto-sent to the agent workspace.
 * After auth, a minimum post-login loader is shown before the portal.
 */
export default function PortalAuthGate({ children, onOpenAgent, onBackToAgent }: Props) {
  const { user, loading, requiresAuth, accountRole, configError } = useAuth();
  const goAgent = onOpenAgent || onBackToAgent;

  useEffect(() => {
    if (requiresAuth && user && accountRole === 'agent') {
      if (goAgent) goAgent();
      else window.location.hash = '';
    }
  }, [requiresAuth, user, accountRole, goAgent]);

  if (requiresAuth && loading) {
    return <PostLoginLoader label="Opening customer portal…" subtitle="Preparing your tickets and chat." />;
  }

  if (requiresAuth && configError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#0c0128] px-4">
        <p className="text-sm text-amber-200 text-center max-w-md">{configError}</p>
        {goAgent && (
          <button type="button" className="text-sm text-fuchsia-300 hover:text-white" onClick={goAgent}>
            Agent workspace →
          </button>
        )}
      </div>
    );
  }

  if (requiresAuth && !user) {
    return <LoginPage audience="customer" onOpenAgent={goAgent} />;
  }

  if (requiresAuth && user && accountRole === 'agent') {
    return (
      <PostLoginLoader
        label="Opening agent workspace…"
        subtitle="This account is for the agent desk — redirecting you now."
      />
    );
  }

  return (
    <PostLoginShell
      ready={!requiresAuth || (!!user && accountRole !== 'agent')}
      label="Opening customer portal…"
      subtitle="Loading your tickets, chat, and account."
    >
      {children}
    </PostLoginShell>
  );
}
