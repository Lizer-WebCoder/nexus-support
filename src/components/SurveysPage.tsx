import { useState } from 'react';
import { Star } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';

export default function SurveysPage() {
  const { surveys, addSurvey } = usePlatform();
  const [ticketId, setTicketId] = useState('');
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');
  const [customerName, setCustomerName] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addSurvey({
      ticket_id: ticketId.trim() || undefined,
      score,
      comment: comment.trim() || undefined,
      customer_name: customerName.trim() || undefined,
    });
    setTicketId('');
    setComment('');
    setCustomerName('');
    setScore(5);
  };

  const avg =
    surveys.length === 0 ? null : surveys.reduce((s, x) => s + x.score, 0) / surveys.length;

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs text-slate-500 uppercase tracking-wide">Responses</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{surveys.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs text-slate-500 uppercase tracking-wide">Avg CSAT</div>
          <div className="text-2xl font-bold text-brand-700 mt-1">
            {avg == null ? '—' : avg.toFixed(1)}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs text-slate-500 uppercase tracking-wide">Promoters (4–5)</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {surveys.filter((s) => s.score >= 4).length}
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 max-w-xl">
        <h2 className="text-sm font-semibold text-slate-800">Log CSAT response</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500">Ticket ID</label>
            <input value={ticketId} onChange={(e) => setTicketId(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg font-mono" placeholder="NX-…" />
          </div>
          <div>
            <label className="text-xs text-slate-500">Customer</label>
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg" />
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-500">Score</label>
          <div className="flex gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setScore(n)}
                className={`p-2 rounded-lg border ${score >= n ? 'bg-brand-50 border-brand-200 text-brand-600' : 'border-slate-200 text-slate-300'}`}>
                <Star size={16} fill={score >= n ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-500">Comment</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} className="w-full px-3 py-2 text-sm border rounded-lg" />
        </div>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg">Save response</button>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              <th className="px-4 py-2">Score</th>
              <th className="px-4 py-2">Ticket</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Comment</th>
            </tr>
          </thead>
          <tbody>
            {surveys.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">No survey responses yet</td></tr>
            )}
            {surveys.map((s) => (
              <tr key={s.id} className="border-t border-slate-100">
                <td className="px-4 py-2 font-semibold text-brand-700">{s.score}</td>
                <td className="px-4 py-2 font-mono text-xs">{s.ticket_id || '—'}</td>
                <td className="px-4 py-2">{s.customer_name || '—'}</td>
                <td className="px-4 py-2 text-slate-600">{s.comment || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
