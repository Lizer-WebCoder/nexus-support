/** Simple multi-tab collision: who is viewing a ticket. */
const PREFIX = 'nexus-viewing:';

export type PresenceEntry = { agentId: string; agentName: string; at: number };

export function claimTicketView(ticketId: string, agentId: string, agentName: string) {
  const key = PREFIX + ticketId;
  const entry: PresenceEntry = { agentId, agentName, at: Date.now() };
  try {
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {}
}

export function releaseTicketView(ticketId: string, agentId: string) {
  const key = PREFIX + ticketId;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const entry = JSON.parse(raw) as PresenceEntry;
    if (entry.agentId === agentId) localStorage.removeItem(key);
  } catch {}
}

export function getOtherViewer(ticketId: string, selfId: string): PresenceEntry | null {
  try {
    const raw = localStorage.getItem(PREFIX + ticketId);
    if (!raw) return null;
    const entry = JSON.parse(raw) as PresenceEntry;
    if (entry.agentId === selfId) return null;
    // stale after 45s
    if (Date.now() - entry.at > 45_000) return null;
    return entry;
  } catch {
    return null;
  }
}
