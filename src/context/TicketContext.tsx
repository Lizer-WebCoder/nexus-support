import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { Ticket, Agent, Customer, Priority, Channel, TicketNote } from '../types';
import { INITIAL_TICKETS, INITIAL_AGENTS, INITIAL_CUSTOMERS, nextTicketId } from '../data';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface TicketContextValue {
  tickets: Ticket[];
  agents: Agent[];
  customers: Customer[];
  loading: boolean;
  usingSupabase: boolean;
  createTicket: (data: {
    title: string;
    description?: string;
    priority: Priority;
    channel: Channel;
    customer_name: string;
    assignee_id?: string;
  }) => Promise<void>;
  updateTicket: (
    id: string,
    updates: Partial<Pick<Ticket, 'status' | 'priority' | 'assignee_id' | 'title' | 'description' | 'notes'>>
  ) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  addNote: (ticketId: string, text: string, author?: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const TicketContext = createContext<TicketContextValue | null>(null);
const STORAGE_KEY = 'nexus-tickets-v1';

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

export function TicketProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(() =>
    isSupabaseConfigured ? [] : loadLocal()
  );
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const attachAssignees = useCallback(
    (list: Ticket[], agentList: Agent[]): Ticket[] =>
      list.map((t) => ({
        ...t,
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
      if (aRes.data) setAgents(aRes.data as Agent[]);
      if (cRes.data) setCustomers(cRes.data as Customer[]);
      if (tRes.data) {
        setTickets(attachAssignees(tRes.data as Ticket[], (aRes.data as Agent[]) || agents));
      }
    } catch (e) {
      console.error('Supabase load failed, using local data', e);
      setTickets(loadLocal());
    } finally {
      setLoading(false);
    }
  }, [attachAssignees, agents]);

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured && tickets.length) {
      saveLocal(tickets);
    }
  }, [tickets]);

  const createTicket = async (data: {
    title: string;
    description?: string;
    priority: Priority;
    channel: Channel;
    customer_name: string;
    assignee_id?: string;
  }) => {
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
        created_at: ticket.created_at,
        updated_at: ticket.updated_at,
      });
      if (error) throw error;
      await refresh();
    } else {
      setTickets((prev) => attachAssignees([ticket, ...prev], agents));
    }
  };

  const updateTicket = async (
    id: string,
    updates: Partial<Pick<Ticket, 'status' | 'priority' | 'assignee_id' | 'title' | 'description' | 'notes'>>
  ) => {
    const updated_at = new Date().toISOString();
    if (supabase) {
      const { error } = await supabase
        .from('tickets')
        .update({ ...updates, updated_at })
        .eq('id', id);
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

  const addNote = async (ticketId: string, text: string, author = 'Sarah Chen') => {
    const note: TicketNote = {
      id: `n-${Date.now()}`,
      text: text.trim(),
      author,
      created_at: new Date().toISOString(),
    };
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;
    const notes = [...(ticket.notes || []), note];
    await updateTicket(ticketId, { notes });
  };

  return (
    <TicketContext.Provider
      value={{
        tickets,
        agents,
        customers,
        loading,
        usingSupabase: isSupabaseConfigured,
        createTicket,
        updateTicket,
        deleteTicket,
        addNote,
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
