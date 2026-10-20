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
  email?: string;
  user_id?: string | null;
  phone?: string;
  timezone?: string;
  is_admin?: boolean;
  bio?: string;
  /** Profile photo (data URL or public URL) */
  avatar_url?: string | null;
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
}

export interface TicketMessage {
  id: string;
  ticket_id?: string;
  author: string;
  text: string;
  kind: 'public' | 'internal';
  created_at: string;
}

export interface Ticket {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  channel: Channel;
  customer_name: string;
  customer_email?: string;
  branch?: string;
  assignee_id?: string | null;
  assignee?: Agent | null;
  created_at: string;
  updated_at?: string;
  sla_due_at?: string | null;
  messages?: TicketMessage[];
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  body: string;
  published?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ChatMessage {
  id: string;
  conversation_id?: string;
  sender: 'agent' | 'customer';
  text: string;
  created_at: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_mime?: string;
}

export interface ChatConversation {
  id: string;
  customer_name: string;
  customer_email?: string;
  branch?: string;
  ticket_id?: string;
  status: 'waiting' | 'active' | 'ended';
  unread: number;
  preview?: string;
  messages?: ChatMessage[];
  created_at?: string;
  updated_at?: string;
}

export const MAX_CHAT_FILE_BYTES = 400_000;

export interface Announcement {
  id?: string;
  title: string;
  body: string;
  severity: 'info' | 'warning' | 'critical';
  active: boolean;
  created_at?: string;
}

export interface Automation {
  id?: string;
  name: string;
  enabled: boolean;
  trigger: string;
  condition_field: string;
  condition_op: string;
  condition_value: string;
  action: string;
  action_value: string;
}

export interface Survey {
  id: string;
  ticket_id?: string;
  score: number;
  comment?: string;
  customer_name?: string;
  created_at?: string;
}

export interface SupportForm {
  id: string;
  name: string;
  description?: string;
  fields: { id: string; label: string; type: string; required?: boolean }[];
  active: boolean;
}

export interface ReleaseNote {
  id: string;
  version: string;
  title: string;
  notes: string;
  released_at: string;
}
