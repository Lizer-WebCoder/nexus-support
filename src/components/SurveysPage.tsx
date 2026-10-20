import { Star } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';

/**
 * Agent-side CSAT dashboard.
 * Scores are submitted by customers on the portal after a ticket is resolved.
 * Agents only review results here — they do not rate themselves.
 */
export default function SurveysPage() {
  const { surveys } = usePlatform();

  const avg =
    surveys.length === 0 ? null : surveys.reduce((s, x) => s + x.score, 0) / surveys.length;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3 text-sm text-brand-900">
        <strong>How CSAT works:</strong> customers rate support on the{' '}
        <span className="font-semibold">Customer Portal</span> when their ticket is resolved.
        This page is for agents/admins to review those scores — not to submit ratings.
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
          <div className="text-xs text-zinc-500 uppercase tracking-wide">Responses</div>
          <div className="text-2xl font-bold text-zinc-900 mt-1">{surveys.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
          <div className="text-xs text-zinc-500 uppercase tracking-wide">Avg CSAT</div>
          <div className="text-2xl font-bold text-brand-700 mt-1">
            {avg == null ? '—' : avg.toFixed(1)}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
          <div className="text-xs text-zinc-500 uppercase tracking-wide">Promoters (4–5)</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {surveys.filter((s) => s.score >= 4).length}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-100 text-sm font-semibold text-zinc-800">
          Customer responses
        </div>
        {surveys.length === 0 && (
          <p className="p-8 text-center text-sm text-zinc-500">
            No ratings yet. When a customer tracks a resolved ticket on the portal, they can leave a 1–5 score here.
          </p>
        )}
        <ul className="divide-y divide-zinc-100">
          {surveys.map((s) => (
            <li key={s.id} className="px-4 py-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium text-zinc-800">
                  {s.customer_name || 'Customer'}
                  {s.ticket_id ? (
                    <span className="ml-2 font-mono text-xs text-zinc-400">{s.ticket_id}</span>
                  ) : null}
                </div>
                {s.comment && <p className="text-sm text-zinc-600 mt-0.5">{s.comment}</p>}
                <div className="text-[11px] text-zinc-400 mt-1">
                  {s.created_at ? new Date(s.created_at).toLocaleString() : ''}
                </div>
              </div>
              <div className="flex items-center gap-0.5 text-brand-600 shrink-0">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < s.score ? 'currentColor' : 'none'}
                    className={i < s.score ? '' : 'text-zinc-200'}
                  />
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
