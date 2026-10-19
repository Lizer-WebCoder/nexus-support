export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Status = 'new' | 'open' | 'pending' | 'resolved' | 'on-hold';
export type Channel = 'email' | 'chat' | 'phone' | 'portal' | 'social';
export type AgentStatus = 'online' | 'busy' | 'away' | 'offline';

export interface Agent {
  id: string;
  name: string;
  initials: string;
  role: string;
  status: AgentStatus;
  color: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  company?: string;
}

export interface TicketNote {
  id: string;
  text: string;
  author: string;
  created_at: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  channel: Channel;
  assignee_id?: string | null;
  customer_id?: string | null;
  customer_name: string;
  created_at: string;
  updated_at?: string;
  notes?: TicketNote[];
  assignee?: Agent | null;
}

export interface TicketFilters {
  status?: Status | 'all';
  priority?: Priority | 'all';
  channel?: Channel | 'all';
  search?: string;
  assignee?: string | 'all' | 'unassigned';
}
