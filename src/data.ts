export interface Ticket {
  id: string;
  title: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'new' | 'open' | 'pending' | 'resolved' | 'on-hold';
  channel: 'email' | 'chat' | 'phone' | 'portal' | 'social';
  assignee?: string;
  createdAt: string;
  customer: string;
}

export interface Agent {
  id: string;
  name: string;
  initials: string;
  role: string;
  tickets: number;
  status: 'online' | 'busy' | 'away' | 'offline';
  color: string;
}

export const pulseData = [
  { time: '00:00', tickets: 12 },
  { time: '02:00', tickets: 8 },
  { time: '04:00', tickets: 5 },
  { time: '06:00', tickets: 9 },
  { time: '08:00', tickets: 22 },
  { time: '10:00', tickets: 38 },
  { time: '12:00', tickets: 45 },
  { time: '14:00', tickets: 52 },
  { time: '16:00', tickets: 41 },
  { time: '18:00', tickets: 33 },
  { time: '20:00', tickets: 28 },
  { time: '22:00', tickets: 19 },
];

export const channelData = [
  { name: 'Email', value: 42, color: '#0ea5e9' },
  { name: 'Live Chat', value: 31, color: '#38bdf8' },
  { name: 'Phone', value: 14, color: '#7dd3fc' },
  { name: 'Portal', value: 8, color: '#bae6fd' },
  { name: 'Social', value: 5, color: '#e0f2fe' },
];

export const tickets: Ticket[] = [
  {
    id: 'NX-2841',
    title: 'Billing mismatch on enterprise subscription',
    priority: 'high',
    status: 'open',
    channel: 'email',
    assignee: 'SC',
    createdAt: '2026-10-18T14:22:00Z',
    customer: 'Acme Corp',
  },
  {
    id: 'NX-2839',
    title: 'SSO login failing for Okta users',
    priority: 'critical',
    status: 'open',
    channel: 'chat',
    assignee: 'MR',
    createdAt: '2026-10-18T13:05:00Z',
    customer: 'TechNova Inc',
  },
  {
    id: 'NX-2837',
    title: 'API rate limit exceeded unexpectedly',
    priority: 'high',
    status: 'pending',
    channel: 'portal',
    assignee: 'AL',
    createdAt: '2026-10-18T11:40:00Z',
    customer: 'DataFlow Systems',
  },
  {
    id: 'NX-2835',
    title: 'Feature request: bulk ticket export',
    priority: 'low',
    status: 'new',
    channel: 'email',
    createdAt: '2026-10-18T10:15:00Z',
    customer: 'BrightPath LLC',
  },
  {
    id: 'NX-2832',
    title: 'Mobile app crashes on iOS 18',
    priority: 'critical',
    status: 'open',
    channel: 'chat',
    assignee: 'TG',
    createdAt: '2026-10-18T09:30:00Z',
    customer: 'MobileFirst Co',
  },
  {
    id: 'NX-2828',
    title: 'Incorrect tax calculation on invoice',
    priority: 'medium',
    status: 'on-hold',
    channel: 'email',
    assignee: 'RK',
    createdAt: '2026-10-17T16:50:00Z',
    customer: 'GlobalTrade Ltd',
  },
];

export const agents: Agent[] = [
  { id: '1', name: 'Sarah Chen', initials: 'SC', role: 'Lead', tickets: 14, status: 'online', color: 'bg-emerald-500' },
  { id: '2', name: 'Marcus Reed', initials: 'MR', role: 'Senior', tickets: 11, status: 'busy', color: 'bg-amber-500' },
  { id: '3', name: 'Aisha Lane', initials: 'AL', role: 'Agent', tickets: 9, status: 'online', color: 'bg-sky-500' },
  { id: '4', name: 'Tomás García', initials: 'TG', role: 'Agent', tickets: 7, status: 'online', color: 'bg-violet-500' },
  { id: '5', name: 'Rachel Kim', initials: 'RK', role: 'Senior', tickets: 6, status: 'away', color: 'bg-rose-500' },
  { id: '6', name: 'David Okonkwo', initials: 'DO', role: 'Agent', tickets: 5, status: 'online', color: 'bg-indigo-500' },
];

export const statusSummary = {
  new: 6,
  open: 11,
  pending: 5,
  resolvedToday: 27,
  breached: 1,
};

export const prioritySummary = {
  critical: 5,
  high: 22,
  medium: 58,
  low: 37,
  onHold: 9,
  unassigned: 18,
};

export const metrics = {
  uptime: 99.7,
  activeConversations: 29,
  queueWait: '1m 42s',
  agentsOnline: 9,
  slaHealth: 96.4,
  dayShiftAgents: 12,
};
