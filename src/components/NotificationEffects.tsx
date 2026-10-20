import { useEffect } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { onAgentNotify } from '../lib/agentNotify';

/**
 * Keeps the bell in sync when notifyAgents writes or tables change.
 * Does NOT create notifications itself — TicketContext / agentNotify own that
 * (avoids duplicate "New ticket" rows).
 */
export default function NotificationEffects() {
  const { refreshPlatform } = usePlatform();

  useEffect(() => {
    return onAgentNotify(() => {
      void refreshPlatform();
    });
  }, [refreshPlatform]);

  useEffect(() => {
    const id = window.setInterval(() => {
      void refreshPlatform();
    }, 15000);
    return () => window.clearInterval(id);
  }, [refreshPlatform]);

  return null;
}
