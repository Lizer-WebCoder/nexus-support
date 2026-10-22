import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginPage from './LoginPage';

interface Props {
  children: ReactNode;
  onOpenAgent?: () => void;
  /** @deprecated use onOpenAgent */
  onBackToAgent?: () => void;
}

/**
 * Customer portal gate: show cosmic login until a customer session exists.
 * Agents who land here are pointed back to the agent workspace.
 */
export default function PortalAuthGate({ children, onOpenAgent, onBackToAgent }: Props) {
  const { user, loading, requiresAuth, accountRole, signOut, configError } = useAuth();
  const goAgent = onOpenAgent || onBackToAgent;

  if (requiresAuth && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c0128] text-fuchsia-200/80 text-sm">
        Loading portal…
      </div>
    );
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#0c0128] px-4">
        <p className="text-sm text-fuchsia-100/80 text-center">
          This is an agent account. Open the agent workspace instead.
        </p>
        <button
          type="button"
          className="text-sm font-medium text-fuchsia-300 hover:text-white"
          onClick={() => {
            if (goAgent) goAgent();
            else window.location.hash = '';
          }}
        >
          Agent workspace →
        </button>
        <button type="button" className="text-xs text-fuchsia-200/50" onClick={() => void signOut()}>
          Sign out
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
