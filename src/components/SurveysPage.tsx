import { useState } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { useTickets } from '../context/TicketContext';

export default function SurveysPage() {
  const { surveys, addSurvey } = usePlatform();
  const { tickets } = useTickets();
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [customer, setCustomer] = useState('');

  const avg = surveys.length ? (surveys.reduce((s, x) => s + x.score, 0) / surveys.length).toFixed(1) : '—';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addSurvey({ score, comment: comment.trim() || undefined, ticket_id: ticketId || undefined, customer_name: customer || undefined });
    setComment('');
    setCustomer('');
    setTicketId('');
    setScore(5);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="text-2xl font-bold text-sky-600">{avg}</div>
          <div className="text-xs text-slate-500">Avg CSAT (1–5)</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="text-2xl font-bold text-slate-900">{surveys.length}</div>
          <div className="text-xs text-slate-500">Responses</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="text-2xl font-bold text-emerald-600">{surveys.filter((s) => s.score >= 4).length}</div>
          <div className="text-xs text-slate-500">Promoters (4–5)</div>
        </div>
      </div>

      <form onSubmit={submit} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-slate-800">Log CSAT response</h3>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setScore(n)}
              className={`w-10 h-10 rounded-lg text-sm font-bold ${score === n ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{n}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <select value={ticketId} onChange={(e) => setTicketId(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
            <option value="">Ticket (optional)</option>
            {tickets.slice(0, 30).map((t) => <option key={t.id} value={t.id}>{t.id} — {t.title.slice(0, 40)}</option>)}
          </select>
          <input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Customer name"
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg" />
        </div>
        <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Comment"
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg">Save response</button>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y">
        {surveys.map((s) => (
          <div key={s.id} className="px-5 py-3 flex items-start gap-3">
            <div className="text-lg font-bold text-sky-600 w-8">{s.score}</div>
            <div className="flex-1">
              <div className="text-sm text-slate-800">{s.comment || 'No comment'}</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {s.customer_name || '—'} {s.ticket_id ? `· ${s.ticket_id}` : ''} · {new Date(s.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
        {surveys.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">No survey responses yet</div>}
      </div>
    </div>
  );
}
