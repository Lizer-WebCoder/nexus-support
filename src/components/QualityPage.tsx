import { useState } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { useTickets } from '../context/TicketContext';
import { useAuth } from '../context/AuthContext';

export default function QualityPage() {
  const { reviews, addReview } = usePlatform();
  const { tickets, agents } = useTickets();
  const { user } = useAuth();
  const [ticketId, setTicketId] = useState('');
  const [agentName, setAgentName] = useState('');
  const [score, setScore] = useState(4);
  const [notes, setNotes] = useState('');

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.score, 0) / reviews.length).toFixed(1) : '—';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addReview({
      ticket_id: ticketId || undefined,
      agent_name: agentName || undefined,
      score,
      notes: notes.trim() || undefined,
      reviewer: (user?.user_metadata?.full_name as string) || user?.email || 'Reviewer',
    });
    setNotes('');
    setTicketId('');
    setAgentName('');
    setScore(4);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="text-2xl font-bold text-violet-600">{avg}</div>
          <div className="text-xs text-slate-500">Avg QA score</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="text-2xl font-bold text-slate-900">{reviews.length}</div>
          <div className="text-xs text-slate-500">Reviews</div>
        </div>
      </div>

      <form onSubmit={submit} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-slate-800">New quality review</h3>
        <div className="grid grid-cols-2 gap-3">
          <select value={ticketId} onChange={(e) => setTicketId(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
            <option value="">Select ticket</option>
            {tickets.slice(0, 40).map((t) => <option key={t.id} value={t.id}>{t.id}</option>)}
          </select>
          <select value={agentName} onChange={(e) => setAgentName(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
            <option value="">Agent</option>
            {agents.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setScore(n)}
              className={`w-10 h-10 rounded-lg text-sm font-bold ${score === n ? 'bg-violet-600 text-white' : 'bg-slate-100'}`}>{n}</button>
          ))}
        </div>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Coaching notes…"
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg">Submit review</button>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y">
        {reviews.map((r) => (
          <div key={r.id} className="px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-violet-600">{r.score}</span>
              <span className="text-sm font-medium text-slate-800">{r.agent_name || '—'}</span>
              <span className="text-xs text-slate-400">{r.ticket_id}</span>
            </div>
            {r.notes && <p className="text-sm text-slate-600 mt-1">{r.notes}</p>}
            <div className="text-xs text-slate-400 mt-1">{r.reviewer} · {new Date(r.created_at).toLocaleString()}</div>
          </div>
        ))}
        {reviews.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">No quality reviews yet</div>}
      </div>
    </div>
  );
}
