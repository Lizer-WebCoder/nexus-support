/** Human SLA remaining / overdue from sla_due_at ISO string. */
export function formatSlaCountdown(slaDueAt: string | null | undefined, status?: string): {
  label: string;
  tone: 'ok' | 'warn' | 'breach' | 'done';
} {
  if (status === 'resolved') return { label: 'Done', tone: 'done' };
  if (!slaDueAt) return { label: '—', tone: 'ok' };
  const due = new Date(slaDueAt).getTime();
  if (Number.isNaN(due)) return { label: '—', tone: 'ok' };
  const ms = due - Date.now();
  const abs = Math.abs(ms);
  const h = Math.floor(abs / 3_600_000);
  const m = Math.floor((abs % 3_600_000) / 60_000);
  const text = h > 0 ? `${h}h ${m}m` : `${m}m`;
  if (ms < 0) return { label: `−${text}`, tone: 'breach' };
  if (ms < 60 * 60 * 1000) return { label: text, tone: 'warn' };
  return { label: text, tone: 'ok' };
}
