/** Simple multi-agent ticket viewing presence via localStorage + BroadcastChannel. */

const KEY = 'nexus-ticket-viewers-v1';

export interface TicketViewer {
  agentId: string;
  name: string;
  ticketId: string;
  at: number;
}

function read(): TicketViewer[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as TicketViewer[];
    const cutoff = Date.now() - 45_000;
    return list.filter((v) => v.at > cutoff);
  } catch {
    return [];
  }
}

function write(list: TicketViewer[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
}

export function claimTicketView(ticketId: string, agentId: string, name: string): TicketViewer[] {
  const others = read().filter((v) => !(v.agentId === agentId && v.ticketId === ticketId));
  const me: TicketViewer = { agentId, name, ticketId, at: Date.now() };
  const next = [...others, me];
  write(next);
  try {
    const bc = new BroadcastChannel('nexus-ticket-view');
    bc.postMessage({ type: 'claim', ...me });
    bc.close();
  } catch {}
  return next.filter((v) => v.ticketId === ticketId && v.agentId !== agentId);
}

export function releaseTicketView(ticketId: string, agentId: string) {
  write(read().filter((v) => !(v.agentId === agentId && v.ticketId === ticketId)));
  try {
    const bc = new BroadcastChannel('nexus-ticket-view');
    bc.postMessage({ type: 'release', ticketId, agentId });
    bc.close();
  } catch {}
}

export function viewersForTicket(ticketId: string, excludeAgentId?: string): TicketViewer[] {
  return read().filter((v) => v.ticketId === ticketId && v.agentId !== excludeAgentId);
}
