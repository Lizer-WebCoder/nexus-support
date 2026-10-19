import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { Ticket, Agent, Customer, Priority, Channel, TicketNote, AgentStatus } from '../types';
import { INITIAL_TICKETS, INITIAL_AGENTS, INITIAL_CUSTOMERS, nextTicketId } from '../data';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface CreateTicketInput {
  title: string;
  description?: string;
  priority: Priority;
  channel: Channel;
  customer_name: string;
  customer_email?: string;
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
    updates: Partial<Pick<Ticket, 'status' | 'priority' | 'assignee_id' | 'title' | 'description' | 'notes'>>
  ) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  addNote: (ticketId: string, text: string, author?: string) => Promise<void>;
  updateAgentStatus: (status: AgentStatus) => Promise<void>;
  findTicket: (id: string, email?: string) => Ticket | undefined;
  refresh: () => Promise<void>;
}

const TicketContext = createContext<TicketContextValue | null>(null);
const STORAGE_KEY = 'nexus-tickets-v1';

const AGENT_COLORS = [
  'bg-sky-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-indigo-500',
];

function loadLocal(): Ticket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_TICKETS;
}

function saveLocal(tickets: Ticket[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  } catch {}
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'AG';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function TicketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>(() =>
    isSupabaseConfigured ? [] : loadLocal()
  );
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);

  const attachAssignees = useCallback(
    (list: Ticket[], agentList: Agent[]): Ticket[] =>
      list.map((t) => ({
        ...t,
        notes: Array.isArray(t.notes) ? t.notes : [],
        assignee: t.assignee_id
          ? agentList.find((a) => a.id === t.assignee_id) || null
          : null,
      })),
    []
  );

  const refresh = useCallback(async () => {
    if (!supabase) {
      setTickets(loadLocal());
      return;
    }
    setLoading(true);
    try {
      const [tRes, aRes, cRes] = await Promise.all([
        supabase.from('tickets').select('*').order('created_at', { ascending: false }),
        supabase.from('agents').select('*'),
        supabase.from('customers').select('*'),
      ]);
      const agentList = (aRes.data as Agent[]) || [];
      if (aRes.data) setAgents(agentList);
      if (cRes.data) setCustomers(cRes.data as Customer[]);
      if (tRes.data) {
        setTickets(attachAssignees(tRes.data as Ticket[], agentList));
      }
    } catch (e) {
      console.error('Supabase load failed, using local data', e);
      setTickets(loadLocal());
    } finally {
      setLoading(false);
    }
  }, [attachAssignees]);

  // Ensure signed-in user has an agents row
  useEffect(() => {
    if (!supabase || !user) {
      setCurrentAgent(null);
      return;
    }

    let cancelled = false;

    (async () => {
      const displayName =
        (user.user_metadata?.full_name as string | undefined) ||
        user.email?.split('@')[0] ||
        'Agent';

      const { data: existing } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (cancelled) return;

      if (existing) {
        setCurrentAgent(existing as Agent);
        setAgents((prev) => {
          if (prev.some((a) => a.id === existing.id)) {
            return prev.map((a) => (a.id === existing.id ? (existing as Agent) : a));
          }
          return [...prev, existing as Agent];
        });
        return;
      }

      // Try match by email first
      if (user.email) {
        const { data: byEmail } = await supabase
          .from('agents')
          .select('*')
          .eq('email', user.email)
          .maybeSingle();

        if (byEmail && !cancelled) {
          await supabase.from('agents').update({ user_id: user.id }).eq('id', byEmail.id);
          const linked = { ...byEmail, user_id: user.id } as Agent;
          setCurrentAgent(linked);
          setAgents((prev) =>
            prev.map((a) => (a.id === linked.id ? linked : a))
          );
          return;
        }
      }

      const color = AGENT_COLORS[Math.floor(Math.random() * AGENT_COLORS.length)];
      const { data: created, error } = await supabase
        .from('agents')
        .insert({
          user_id: user.id,
          name: displayName,
          initials: initialsFromName(displayName),
          role: 'Agent',
          status: 'online',
          color,
          email: user.email || null,
        })
        .select('*')
        .single();

      if (!error && created && !cancelled) {
        setCurrentAgent(created as Agent);
        setAgents((prev) => [...prev, created as Agent]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Realtime: refresh when tickets/agents change
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('nexus-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        () => {
          refresh();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agents' },
        () => {
          refresh();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customers' },
        () => {
          refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  useEffect(() => {
    if (!isSupabaseConfigured && tickets.length) {
      saveLocal(tickets);
    }
  }, [tickets]);

  const createTicket = async (data: CreateTicketInput): Promise<Ticket> => {
    const id = nextTicketId(tickets);
    const now = new Date().toISOString();
    const ticket: Ticket = {
      id,
      title: data.title,
      description: data.description || '',
      priority: data.priority,
      status: 'new',
      channel: data.channel,
      assignee_id: data.assignee_id || null,
      customer_name: data.customer_name,
      customer_email: data.customer_email || '',
      created_at: now,
      updated_at: now,
      notes: [],
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
        customer_email: ticket.customer_email || null,
        notes: [],
        created_at: ticket.created_at,
        updated_at: ticket.updated_at,
      });
      if (error) throw error;
      await refresh();
    } else {
      setTickets((prev) => attachAssignees([ticket, ...prev], agents));
    }
    return ticket;
  };

  const updateTicket = async (
    id: string,
    updates: Partial<Pick<Ticket, 'status' | 'priority' | 'assignee_id' | 'title' | 'description' | 'notes'>>
  ) => {
    const updated_at = new Date().toISOString();
    if (supabase) {
      const payload: Record<string, unknown> = { ...updates, updated_at };
      const { error } = await supabase.from('tickets').update(payload).eq('id', id);
      if (error) throw error;
      await refresh();
    } else {
      setTickets((prev) =>
        attachAssignees(
          prev.map((t) => (t.id === id ? { ...t, ...updates, updated_at } : t)),
          agents
        )
      );
    }
  };

  const deleteTicket = async (id: string) => {
    if (supabase) {
      const { error } = await supabase.from('tickets').delete().eq('id', id);
      if (error) throw error;
      await refresh();
    } else {
      setTickets((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const addNote = async (ticketId: string, text: string, author?: string) => {
    const authorName =
      author ||
      currentAgent?.name ||
      (user?.user_metadata?.full_name as string | undefined) ||
      user?.email?.split('@')[0] ||
      'Agent';

    const note: TicketNote = {
      id: `n-${Date.now()}`,
      text: text.trim(),
      author: authorName,
      created_at: new Date().toISOString(),
    };
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;
    const notes = [...(ticket.notes || []), note];
    await updateTicket(ticketId, { notes });
  };

  const updateAgentStatus = async (status: AgentStatus) => {
    if (!currentAgent) return;
    if (supabase) {
      const { error } = await supabase
        .from('agents')
        .update({ status })
        .eq('id', currentAgent.id);
      if (error) throw error;
      setCurrentAgent({ ...currentAgent, status });
      setAgents((prev) =>
        prev.map((a) => (a.id === currentAgent.id ? { ...a, status } : a))
      );
    } else {
      setCurrentAgent({ ...currentAgent, status });
      setAgents((prev) =>
        prev.map((a) => (a.id === currentAgent.id ? { ...a, status } : a))
      );
    }
  };

  const findTicket = (id: string, email?: string) => {
    const t = tickets.find((x) => x.id.toLowerCase() === id.trim().toLowerCase());
    if (!t) return undefined;
    if (email && t.customer_email) {
      if (t.customer_email.toLowerCase() !== email.trim().toLowerCase()) return undefined;
    }
    return t;
  };

  return (
    <TicketContext.Provider
      value={{
        tickets,
        agents,
        customers,
        loading,
        usingSupabase: isSupabaseConfigured,
        currentAgent,
        createTicket,
        updateTicket,
        deleteTicket,
        addNote,
        updateAgentStatus,
        findTicket,
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
