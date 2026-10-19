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

export interface TicketMessage {
  id: string;
  text: string;
  author: string;
  kind: 'public' | 'internal';
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
  customer_email?: string;
  created_at: string;
  updated_at?: string;
  notes?: TicketNote[];
  messages?: TicketMessage[];
  tags?: string[];
  sla_due_at?: string | null;
  first_response_at?: string | null;
  assignee?: Agent | null;
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
}

export interface ChatConversation {
  id: string;
  customer_name: string;
  customer_email?: string;
  status: 'active' | 'waiting' | 'ended';
  preview: string;
  unread: number;
  messages?: ChatMessage[];
  created_at?: string;
  updated_at?: string;
}

export interface AppNotification {
  id: string;
  user_id?: string;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  created_at: string;
}

export interface Automation {
  id: string;
  name: string;
  enabled: boolean;
  trigger: string;
  condition_field?: string;
  condition_op?: string;
  condition_value?: string;
  action: string;
  action_value?: string;
}

export interface CannedResponse {
  id: string;
  title: string;
  body: string;
  shortcut?: string;
}

export interface SurveyResponse {
  id: string;
  ticket_id?: string;
  score: number;
  comment?: string;
  customer_name?: string;
  created_at: string;
}

export interface QualityReview {
  id: string;
  ticket_id?: string;
  agent_name?: string;
  score: number;
  notes?: string;
  reviewer?: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  severity: 'info' | 'warning' | 'critical';
  active: boolean;
  created_at: string;
}

export interface FormDef {
  id: string;
  name: string;
  description?: string;
  fields: { id: string; label: string; type: string; required?: boolean }[];
  active: boolean;
}

export interface Release {
  id: string;
  version: string;
  title: string;
  notes: string;
  released_at: string;
}

export interface TicketFilters {
  status?: Status | 'all';
  priority?: Priority | 'all';
  channel?: Channel | 'all';
  search?: string;
  assignee?: string | 'all' | 'unassigned';
}

/** SLA hours by priority: first response / resolve */
export const SLA_HOURS: Record<Priority, { first: number; resolve: number }> = {
  critical: { first: 0.25, resolve: 4 },
  high: { first: 1, resolve: 8 },
  medium: { first: 4, resolve: 24 },
  low: { first: 8, resolve: 72 },
};

export function computeSlaDue(priority: Priority, createdAt: string): string {
  const hours = SLA_HOURS[priority]?.resolve ?? 24;
  return new Date(new Date(createdAt).getTime() + hours * 3600000).toISOString();
}
