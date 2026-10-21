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
  avatar_url?: string | null;
  signature?: string | null;
  skills?: string[] | null;
  preferred_language?: string | null;
  work_hours_start?: string | null;
  work_hours_end?: string | null;
  out_of_office?: boolean | null;
  ooo_message?: string | null;
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
  first_response_at?: string | null;
  messages?: TicketMessage[];
  notes?: TicketNote[];
  attachments?: TicketAttachment[];
  deleted_at?: string | null;
}

const SLA_HOURS: Record<Priority, number> = {
  critical: 2,
  high: 8,
  medium: 24,
  low: 72,
};

export function computeSlaDue(priority: Priority, fromIso?: string): string {
  const start = fromIso ? new Date(fromIso).getTime() : Date.now();
  const hours = SLA_HOURS[priority] ?? 24;
  return new Date(start + hours * 60 * 60 * 1000).toISOString();
}

export function ticketBranch(t: Pick<Ticket, 'branch' | 'customer_name'>): string {
  if (t.branch && t.branch.trim()) return t.branch.trim();
  return 'Unassigned';
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

export interface AppNotification {
  id: string;
  user_id?: string | null;
  title: string;
  body: string;
  link?: string | null;
  read: boolean;
  created_at: string;
}

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

export interface CannedResponse {
  id: string;
  title: string;
  body: string;
  shortcut?: string;
}

export interface Survey {
  id: string;
  ticket_id?: string;
  score: number;
  comment?: string;
  customer_name?: string;
  created_at?: string;
}

export type SurveyResponse = Survey;

export interface QualityReview {
  id: string;
  ticket_id?: string;
  score: number;
  notes?: string;
  reviewer?: string;
  agent_name?: string;
  created_at?: string;
}

export interface SupportForm {
  id: string;
  name: string;
  description?: string;
  fields: { id: string; label: string; type: string; required?: boolean }[];
  active: boolean;
}

export type FormDef = SupportForm;

export interface ReleaseNote {
  id: string;
  version: string;
  title: string;
  notes: string;
  released_at: string;
}

export type Release = ReleaseNote;

export interface AuditEntry {
  id: string;
  entity: string;
  entity_id: string;
  action: string;
  detail?: string;
  actor?: string;
  created_at: string;
}
