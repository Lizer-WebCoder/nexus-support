import type { Ticket, Agent, Customer, Branch } from './types';

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

export const INITIAL_AGENTS: Agent[] = [
  { id: '1', name: 'Sarah Chen', initials: 'SC', role: 'Lead', status: 'online', color: 'bg-emerald-500' },
  { id: '2', name: 'Marcus Reed', initials: 'MR', role: 'Senior', status: 'busy', color: 'bg-amber-500' },
  { id: '3', name: 'Aisha Lane', initials: 'AL', role: 'Agent', status: 'online', color: 'bg-sky-500' },
  { id: '4', name: 'Tomás García', initials: 'TG', role: 'Agent', status: 'online', color: 'bg-violet-500' },
  { id: '5', name: 'Rachel Kim', initials: 'RK', role: 'Senior', status: 'away', color: 'bg-rose-500' },
  { id: '6', name: 'David Okonkwo', initials: 'DO', role: 'Agent', status: 'online', color: 'bg-indigo-500' },
];

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'b1',
    name: 'CIRIAN BRANCH',
    email: 'cirian@company.com',
    members: [
      { id: 'm1', name: 'Ana Reyes', email: 'ana.reyes@company.com', role: 'Branch lead' },
      { id: 'm2', name: 'Ben Cruz', email: 'ben.cruz@company.com', role: 'Staff' },
    ],
  },
  {
    id: 'b2',
    name: 'ORMOC BRANCH',
    email: 'ormoc@company.com',
    members: [
      { id: 'm3', name: 'Carla Santos', email: 'carla.santos@company.com', role: 'Branch lead' },
      { id: 'm4', name: 'Diego Lim', email: 'diego.lim@company.com', role: 'Staff' },
    ],
  },
  {
    id: 'b3',
    name: 'MAASIN BRANCH',
    email: 'maasin@company.com',
    members: [
      { id: 'm5', name: 'Elena Flores', email: 'elena.flores@company.com', role: 'Branch lead' },
    ],
  },
  {
    id: 'b4',
    name: 'SOGOD BRANCH',
    email: 'sogod@company.com',
    members: [
      { id: 'm6', name: 'Felix Tan', email: 'felix.tan@company.com', role: 'Branch lead' },
      { id: 'm7', name: 'Gina Ong', email: 'gina.ong@company.com', role: 'Staff' },
    ],
  },
  {
    id: 'b5',
    name: 'AVENIDA BRANCH',
    email: 'avenida@company.com',
    members: [
      { id: 'm8', name: 'Harold Yu', email: 'harold.yu@company.com', role: 'Branch lead' },
    ],
  },
  {
    id: 'b6',
    name: 'ABUCAY BRANCH',
    email: 'abucay@company.com',
    members: [
      { id: 'm9', name: 'Iris Mendoza', email: 'iris.mendoza@company.com', role: 'Branch lead' },
      { id: 'm10', name: 'Jake Villanueva', email: 'jake.v@company.com', role: 'Staff' },
    ],
  },
];

/** Legacy seed for customers table compatibility */
export const INITIAL_CUSTOMERS: Customer[] = INITIAL_BRANCHES.map((b) => ({
  id: b.id,
  name: b.name,
  email: b.email,
  company: b.name,
}));

export const INITIAL_TICKETS: Ticket[] = [
  { id: 'NX-2841', title: 'Billing mismatch on enterprise subscription', description: 'Customer was charged twice for the annual plan.', priority: 'high', status: 'open', channel: 'email', assignee_id: '1', customer_name: 'Ana Reyes', customer_email: 'ana.reyes@company.com', branch: 'CIRIAN BRANCH', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'NX-2839', title: 'SSO login failing for Okta users', description: 'Users redirected to error page after Okta auth.', priority: 'critical', status: 'open', channel: 'chat', assignee_id: '2', customer_name: 'Ben Cruz', customer_email: 'ben.cruz@company.com', branch: 'CIRIAN BRANCH', created_at: new Date(Date.now() - 18000000).toISOString() },
  { id: 'NX-2837', title: 'API rate limit exceeded unexpectedly', description: 'Production API hitting 429s under normal load.', priority: 'high', status: 'pending', channel: 'portal', assignee_id: '3', customer_name: 'Carla Santos', customer_email: 'carla.santos@company.com', branch: 'ORMOC BRANCH', created_at: new Date(Date.now() - 28800000).toISOString() },
  { id: 'NX-2835', title: 'Feature request: bulk ticket export', description: 'Need CSV/JSON export for closed tickets.', priority: 'low', status: 'new', channel: 'email', customer_name: 'Diego Lim', customer_email: 'diego.lim@company.com', branch: 'ORMOC BRANCH', created_at: new Date(Date.now() - 36000000).toISOString() },
  { id: 'NX-2832', title: 'Mobile app crashes on iOS 18', description: 'Crash on launch after updating to iOS 18.1.', priority: 'critical', status: 'open', channel: 'chat', assignee_id: '4', customer_name: 'Elena Flores', customer_email: 'elena.flores@company.com', branch: 'MAASIN BRANCH', created_at: new Date(Date.now() - 43200000).toISOString() },
  { id: 'NX-2828', title: 'Incorrect tax calculation on invoice', description: 'VAT applied incorrectly for EU customers.', priority: 'medium', status: 'on-hold', channel: 'email', assignee_id: '5', customer_name: 'Felix Tan', customer_email: 'felix.tan@company.com', branch: 'SOGOD BRANCH', created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: 'NX-2825', title: 'Password reset emails not arriving', description: 'Multiple users report missing reset links.', priority: 'high', status: 'open', channel: 'email', assignee_id: '1', customer_name: 'Gina Ong', customer_email: 'gina.ong@company.com', branch: 'SOGOD BRANCH', created_at: new Date(Date.now() - 10800000).toISOString() },
  { id: 'NX-2821', title: 'Dashboard charts loading slowly', description: 'Ticket pulse chart takes >8s on first load.', priority: 'medium', status: 'new', channel: 'portal', customer_name: 'Harold Yu', customer_email: 'harold.yu@company.com', branch: 'AVENIDA BRANCH', created_at: new Date(Date.now() - 21600000).toISOString() },
  { id: 'NX-2818', title: 'Cannot attach files larger than 5MB', description: 'Upload fails silently for larger screenshots.', priority: 'medium', status: 'pending', channel: 'chat', assignee_id: '3', customer_name: 'Iris Mendoza', customer_email: 'iris.mendoza@company.com', branch: 'ABUCAY BRANCH', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'NX-2814', title: 'Dark mode preference not saved', description: 'Setting resets on every login.', priority: 'low', status: 'resolved', channel: 'portal', assignee_id: '6', customer_name: 'Jake Villanueva', customer_email: 'jake.v@company.com', branch: 'ABUCAY BRANCH', created_at: new Date(Date.now() - 14400000).toISOString() },
];

export function nextTicketId(existing: Ticket[]): string {
  const nums = existing.map((t) => parseInt(t.id.replace('NX-', ''), 10)).filter((n) => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 2800;
  return `NX-${max + 1}`;
}
