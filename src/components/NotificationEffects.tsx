import { useEffect, useRef } from 'react';
import { useTickets } from '../context/TicketContext';
import { usePlatform } from '../context/PlatformContext';
import { onAgentNotify } from '../lib/agentNotify';

/**
 * Keeps the bell in sync when tickets/chats change, and when notifyAgents fires.
 * Complements server-side inserts from TicketContext / agentNotify.
 */
export default function NotificationEffects() {
  const { tickets } = useTickets();
  const { conversations, refreshPlatform, pushNotification } = usePlatform();
  const prevTicketIds = useRef<Set<string>>(new Set());
  const prevMsgSig = useRef<string>('');
  const ready = useRef(false);

  // Reload notification list whenever agentNotify writes (Supabase or local)
  useEffect(() => {
    return onAgentNotify(() => {
      void refreshPlatform();
    });
  }, [refreshPlatform]);

  // Soft-poll platform tables so chat + notifications stay fresh
  useEffect(() => {
    const id = window.setInterval(() => {
      void refreshPlatform();
    }, 12000);
    return () => window.clearInterval(id);
  }, [refreshPlatform]);

  useEffect(() => {
    const ids = new Set(tickets.map((t) => t.id));
    if (!ready.current) {
      prevTicketIds.current = ids;
      ready.current = true;
      return;
    }
    for (const t of tickets) {
      if (!prevTicketIds.current.has(t.id)) {
        void pushNotification(
          'New ticket',
          `${t.id}: ${t.title} · ${t.customer_name}`,
          'tickets'
        );
      }
    }
    prevTicketIds.current = ids;
  }, [tickets, pushNotification]);

  useEffect(() => {
    const sig = conversations
      .map((c) => `${c.id}:${(c.messages || []).length}:${c.preview || ''}`)
      .join('|');
    if (!prevMsgSig.current) {
      prevMsgSig.current = sig;
      return;
    }
    if (sig === prevMsgSig.current) return;

    for (const c of conversations) {
      const msgs = c.messages || [];
      const last = msgs[msgs.length - 1];
      if (last?.sender === 'customer') {
        const key = `${c.id}:${last.id}`;
        if (!prevMsgSig.current.includes(key) && c.unread > 0) {
          void pushNotification(
            'Live chat reply',
            `${c.customer_name}: ${(last.text || '').slice(0, 120)}`,
            'chat'
          );
        }
      }
    }
    prevMsgSig.current = sig;
  }, [conversations, pushNotification]);

  return null;
}
