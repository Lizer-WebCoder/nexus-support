import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { Ticket, Agent, Customer, Priority, Channel, TicketNote, TicketMessage, AgentStatus } from '../types';
import { computeSlaDue } from '../types';
import { INITIAL_TICKETS, INITIAL_AGENTS, INITIAL_CUSTOMERS, nextTicketId } from '../data';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { notifyAgents } from '../lib/agentNotify';
import { pushAudit } from '../lib/audit';
import { pickAssignee } from '../lib/assign';

interface CreateTicketInput {
  title: string;
  description?: string;
  priority: Priority;
  channel: Channel;
  customer_name: string;
  customer_email?: string;
  branch?: string;
  assignee_id?: string;
}

interface TicketContextValue {
  tickets: Ticket[];
  agents: Agent[];
  customers: Customer[];
  loading: boolean;
  usingSupabase: boolean;
  currentAgent: Agent | null;
  createTicket: (data: CreateTicketInput) => Promise<Ticket>;
  updateTicket: (
    id: string,
    updates: Partial<
      Pick<
        Ticket,
        | 'status'
        | 'priority'
        | 'assignee_id'
        | 'title'
        | 'description'
        | 'notes'
        | 'messages'
        | 'first_response_at'
        | 'branch'
        | 'attachments'
        | 'deleted_at'
      >
    >
  ) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  addNote: (ticketId: string, text: string, author?: string) => Promise<void>;
  addMessage: (ticketId: string, text: string, kind?: 'public' | 'internal') => Promise<void>;
  updateAgentStatus: (status: AgentStatus) => Promise<void>;
  findTicket: (id: string, email?: string) => Ticket | undefined;
  ticketsForEmail: (email: string) => Ticket[];
  setAgentAdmin: (agentId: string, is_admin: boolean) => Promise<void>;
  refresh: () => Promise<void>;
}

const TicketContext = createContext<TicketContextValue | null>(null);
const STORAGE_KEY = 'nexus-tickets-v1';

function loadLocal(): Ticket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Ticket[];
  } catch {}
  return INITIAL_TICKETS;
}

function saveLocal(tickets: Ticket[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  } catch {}
}

function hydrateAvatar(agent: Agent): Agent {
  if (agent.avatar_url) return agent;
  try {
    const local = localStorage.getItem(`nexus-avatar-${agent.id}`);
    if (local) return { ...agent, avatar_url: local };
  } catch {}
  return agent;
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'AG';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function TicketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>(() => (isSupabaseConfigured ? [] : loadLocal()));
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const usingSupabase = isSupabaseConfigured;

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [tRes, aRes, cRes] = await Promise.all([
        supabase.from('tickets').select('*').order('created_at', { ascending: false }),
        supabase.from('agents').select('*'),
        supabase.from('customers').select('*'),
      ]);
      const agentList = ((aRes.data as Agent[]) || []).map(hydrateAvatar);
      if (aRes.data) setAgents(agentList);
      if (cRes.data) setCustomers(cRes.data as Customer[]);
      if (tRes.data) {
        const list = (tRes.data as Ticket[]).map((t) => ({
          ...t,
          assignee: agentList.find((a) => a.id === t.assignee_id) || null,
          notes: t.notes || [],
          messages: t.messages || [],
          attachments: t.attachments || [],
        }));
        setTickets(list);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!user || !supabase) {
      setCurrentAgent(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data: existing } = await supabase.from('agents').select('*').eq('user_id', user.id).maybeSingle();
      if (cancelled) return;
      if (existing) {
        setCurrentAgent(hydrateAvatar(existing as Agent));
        return;
      }
      if (user.email) {
        const { data: byEmail } = await supabase.from('agents').select('*').eq('email', user.email).maybeSingle();
        if (byEmail && !cancelled) {
          await supabase.from('agents').update({ user_id: user.id }).eq('id', byEmail.id);
          const linked = hydrateAvatar({ ...byEmail, user_id: user.id } as Agent);
          setCurrentAgent(linked);
          setAgents((prev) => prev.map((a) => (a.id === linked.id ? linked : a)));
          return;
        }
      }
      const displayName = (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'Agent';
      const { data: created } = await supabase
        .from('agents')
        .insert({
          user_id: user.id,
          name: displayName,
          initials: initialsFromName(displayName),
          role: 'Agent',
          status: 'online',
          email: user.email || null,
          color: '#6366f1',
        })
        .select('*')
        .single();
      if (created && !cancelled) {
        const agent = hydrateAvatar(created as Agent);
        setCurrentAgent(agent);
        setAgents((prev) => [...prev, agent]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel('nexus-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => refresh())
      .subscribe();
    return () => {
      supabase?.removeChannel(channel);
    };
  }, [refresh]);

  useEffect(() => {
    if (!isSupabaseConfigured && tickets.length) saveLocal(tickets);
  }, [tickets]);

  const createTicket = async (data: CreateTicketInput): Promise<Ticket> => {
    const id = nextTicketId(tickets);
    const now = new Date().toISOString();
    const sla_due_at = computeSlaDue(data.priority, now);
    const autoAssignee =
      data.assignee_id ||
      pickAssignee(agents, tickets, { branch: data.branch?.trim() }) ||
      null;
    const ticket: Ticket = {
      id,
      title: data.title,
      description: data.description || '',
      priority: data.priority,
      status: 'new',
      channel: data.channel,
      assignee_id: autoAssignee,
      customer_name: data.customer_name,
      customer_email: data.customer_email || '',
      branch: data.branch?.trim() || undefined,
      created_at: now,
      updated_at: now,
      notes: [],
      messages: [],
      attachments: [],
      sla_due_at,
    };
    if (supabase) {
      const { error } = await supabase.from('tickets').insert({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        status: ticket.status,
        channel: ticket.channel,
        assignee_id: ticket.assignee_id,
        customer_name: ticket.customer_name,
        customer_email: ticket.customer_email,
        branch: ticket.branch || null,
        notes: ticket.notes,
        messages: ticket.messages,
        attachments: ticket.attachments,
        sla_due_at: ticket.sla_due_at,
        created_at: ticket.created_at,
        updated_at: ticket.updated_at,
      });
      if (error) throw error;
      await refresh();
    } else {
      setTickets((prev) => [ticket, ...prev]);
    }
    void notifyAgents({
      title: 'New ticket',
      body: `${ticket.id}: ${ticket.title} · ${ticket.customer_name}${ticket.channel ? ` (${ticket.channel})` : ''}`,
      link: 'tickets',
    });
    pushAudit({
      entity: 'ticket',
      entity_id: ticket.id,
      action: 'create',
      detail: `${ticket.title}${autoAssignee ? ` · assigned ${autoAssignee}` : ''}`,
      actor: currentAgent?.name || user?.email || 'Agent',
    });
    return ticket;
  };

  const updateTicket = async (
    id: string,
    updates: Partial<
      Pick<
        Ticket,
        | 'status'
        | 'priority'
        | 'assignee_id'
        | 'title'
        | 'description'
        | 'notes'
        | 'messages'
        | 'first_response_at'
        | 'branch'
        | 'attachments'
        | 'deleted_at'
      >
    >
  ) => {
    const ticket = tickets.find((t) => t.id === id);
    const payload = { ...updates, updated_at: new Date().toISOString() };
    if (supabase) {
      const { error } = await supabase.from('tickets').update(payload).eq('id', id);
      if (error) throw error;
      await refresh();
    } else {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                ...updates,
                updated_at: payload.updated_at,
                assignee:
                  updates.assignee_id !== undefined
                    ? agents.find((a) => a.id === updates.assignee_id) || null
                    : t.assignee,
              }
            : t
        )
      );
    }
    const changed = Object.keys(updates).filter((k) => k !== 'messages' && k !== 'notes' && k !== 'attachments');
    if (changed.length) {
      pushAudit({
        entity: 'ticket',
        entity_id: id,
        action: updates.deleted_at ? 'soft_delete' : updates.deleted_at === null ? 'restore' : 'update',
        detail: changed.map((k) => `${k}=${JSON.stringify((updates as Record<string, unknown>)[k])}`).join(', '),
        actor: currentAgent?.name || user?.email || 'Agent',
      });
      const assignee = updates.assignee_id
        ? agents.find((a) => a.id === updates.assignee_id)
        : ticket?.assignee_id
          ? agents.find((a) => a.id === ticket.assignee_id)
          : null;
      const summary = changed.map((k) => `${k}: ${(updates as Record<string, unknown>)[k]}`).join(', ');
      void notifyAgents({
        title: 'Ticket updated',
        body: `${id}${ticket ? ` · ${ticket.title}` : ''} — ${summary}`,
        link: 'tickets',
        userId: (assignee as Agent & { user_id?: string })?.user_id || undefined,
      });
    }
  };

  const deleteTicket = async (id: string) => {
    if (!currentAgent?.is_admin) {
      throw new Error('Only admins can permanently delete tickets');
    }
    if (supabase) {
      const { error } = await supabase.from('tickets').delete().eq('id', id);
      if (error) throw error;
      await refresh();
    } else {
      setTickets((prev) => prev.filter((t) => t.id !== id));
    }
    pushAudit({ entity: 'ticket', entity_id: id, action: 'hard_delete', actor: currentAgent?.name || user?.email || 'Agent' });
  };

  const authorName = () =>
    currentAgent?.name || (user?.user_metadata?.full_name as string | undefined) || user?.email?.split('@')[0] || 'Agent';

  const addNote = async (ticketId: string, text: string, author?: string) => {
    const note: TicketNote = {
      id: `n-${Date.now()}`,
      text: text.trim(),
      author: author || authorName(),
      created_at: new Date().toISOString(),
    };
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;
    await updateTicket(ticketId, { notes: [...(ticket.notes || []), note] });
  };

  const addMessage = async (ticketId: string, text: string, kind: 'public' | 'internal' = 'public') => {
    const msg: TicketMessage = {
      id: `m-${Date.now()}`,
      text: text.trim(),
      author: authorName(),
      kind,
      created_at: new Date().toISOString(),
    };
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;
    const messages = [...(ticket.messages || []), msg];
    const updates: Parameters<typeof updateTicket>[1] = { messages };
    if (!ticket.first_response_at && kind === 'public') updates.first_response_at = msg.created_at;
    await updateTicket(ticketId, updates);
    if (kind === 'public') {
      const assignee = ticket.assignee_id ? agents.find((a) => a.id === ticket.assignee_id) : null;
      void notifyAgents({
        title: 'Ticket reply',
        body: `${ticketId}: new message on “${ticket.title}”`,
        link: 'tickets',
        userId: (assignee as Agent & { user_id?: string })?.user_id || undefined,
      });
    }
  };

  const updateAgentStatus = async (status: AgentStatus) => {
    if (!currentAgent) return;
    if (supabase) {
      const { error } = await supabase.from('agents').update({ status }).eq('id', currentAgent.id);
      if (error) throw error;
      setCurrentAgent({ ...currentAgent, status });
      setAgents((prev) => prev.map((a) => (a.id === currentAgent.id ? { ...a, status } : a)));
    } else {
      setCurrentAgent({ ...currentAgent, status });
      setAgents((prev) => prev.map((a) => (a.id === currentAgent.id ? { ...a, status } : a)));
    }
  };

  const findTicket = (id: string, email?: string) => {
    const t = tickets.find((x) => x.id.toLowerCase() === id.trim().toLowerCase());
    if (!t) return undefined;
    if (email && t.customer_email && t.customer_email.toLowerCase() !== email.toLowerCase()) return undefined;
    return t;
  };

  const ticketsForEmail = (email: string) =>
    tickets.filter((t) => (t.customer_email || '').toLowerCase() === email.toLowerCase());

  const setAgentAdmin = async (agentId: string, is_admin: boolean) => {
    if (supabase) {
      await supabase.from('agents').update({ is_admin }).eq('id', agentId);
      setAgents((prev) => prev.map((a) => (a.id === agentId ? { ...a, is_admin } : a)));
      if (currentAgent?.id === agentId) setCurrentAgent({ ...currentAgent, is_admin });
    } else {
      setAgents((prev) => prev.map((a) => (a.id === agentId ? { ...a, is_admin } : a)));
      if (currentAgent?.id === agentId) setCurrentAgent({ ...currentAgent, is_admin });
    }
  };

  return (
    <TicketContext.Provider
      value={{
        tickets,
        agents,
        customers,
        loading,
        usingSupabase,
        currentAgent,
        createTicket,
        updateTicket,
        deleteTicket,
        addNote,
        addMessage,
        updateAgentStatus,
        findTicket,
        ticketsForEmail,
        setAgentAdmin,
        refresh,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  const ctx = useContext(TicketContext);
  if (!ctx) throw new Error('useTickets must be used within TicketProvider');
  return ctx;
}
