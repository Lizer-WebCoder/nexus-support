import { useState } from 'react';
import { Megaphone, Plus, Trash2 } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';

export default function AnnouncementsPage() {
  const { announcements, saveAnnouncement, deleteAnnouncement } = usePlatform();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [severity, setSeverity] = useState<'info' | 'warning' | 'critical'>('info');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    await saveAnnouncement({ title: title.trim(), body: body.trim(), severity, active: true });
    setTitle('');
    setBody('');
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="text-brand-600" size={20} />
          <h2 className="text-lg font-semibold text-zinc-900">Announcements</h2>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            required
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Message"
            rows={3}
            className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            required
          />
          <div className="flex items-center gap-3">
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as 'info' | 'warning' | 'critical')}
              className="px-3 py-2 text-sm border border-zinc-200 rounded-xl bg-white"
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
            <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700">
              <Plus size={16} /> Publish
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-3">
        {announcements.map((a) => (
          <div key={a.id || a.title} className="bg-white rounded-xl border border-zinc-200 p-4 shadow-sm">
            <div className="flex justify-between gap-2">
              <div>
                <div className="font-semibold text-slate-900">{a.title}</div>
                <p className="text-sm text-slate-700 mt-1">{a.body}</p>
                <div className="text-[11px] text-slate-500 mt-2 capitalize">{a.severity} · {a.active ? 'Active' : 'Off'}</div>
              </div>
              <button type="button" onClick={() => a.id && deleteAnnouncement(a.id)} className="text-slate-400 hover:text-rose-600"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {announcements.length === 0 && <p className="text-sm text-slate-500 text-center py-6">No announcements</p>}
      </div>
    </div>
  );
}
