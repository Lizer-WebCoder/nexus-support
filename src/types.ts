export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Status = 'new' | 'open' | 'pending' | 'on-hold' | 'resolved';
export type Channel = 'email' | 'chat' | 'portal' | 'phone' | 'social';
export type AgentStatus = 'online' | 'busy' | 'away' | 'offline';

export interface Agent {
  id: string;
  name: string;
  initials: string;
  role: string;
  status: AgentStatus;
  color: string;
  email?: string;
  phone?: string;
  bio?: string;
  timezone?: string;
  is_admin?: boolean;
  avatar_url?: string | null;
  branch?: string | null;
}

export interface BranchMember {
  id: string;
  name: string;
  email?: string;
  role?: string;
}

export interface Branch {
  id: string;
  name: string;
  email?: string;
  members: BranchMember[];
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  company?: string;
  role?: string;
  branch?: string | null;
  /** pending = awaiting admin approval; approved = can use portal fully */
  status?: 'pending' | 'approved' | 'rejected' | null;
  created_at?: string;
}

export interface TicketMessage {
  id: string;
  ticket_id?: string;
  author: string;
  text: string;
  kind: 'public' | 'internal';
  created_at: string;
}

export interface TicketNote {
  id: string;
  text: string;
  author: string;
  created_at: string;
}

export interface TicketAttachment {
  id: string;
  name: string;
  size: number;
  mime: string;
  url: string;
  created_at: string;
  uploaded_by?: string;
}

export const MAX_ATTACHMENT_BYTES = 400_000;
export const MAX_CHAT_FILE_BYTES = 400_000;

export interface Ticket {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  channel: Channel;
  assignee_id?: string;
  assignee?: Agent;
  customer_name: string;
  customer_email?: string;
  branch?: string;
  created_at: string;
  updated_at?: string;
  sla_due_at?: string | null;
  deleted_at?: string | null;
  messages?: TicketMessage[];
  notes?: TicketNote[];
  attachments?: TicketAttachment[];
  csat?: number | null;
}

export function ticketBranch(t: Pick<Ticket, 'branch' | 'customer_name'>): string {
  if (t.branch && t.branch.trim()) return t.branch.trim();
  return '';
}
