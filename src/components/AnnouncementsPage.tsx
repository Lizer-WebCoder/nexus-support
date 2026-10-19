import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import type { Announcement } from '../types';

export default function AnnouncementsPage() {
  const { announcements, saveAnnouncement, deleteAnnouncement } = usePlatform();
  const [form, setForm] = useState<Partial<Announcement> | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form?.title || !form.body) return;
    await saveAnnouncement({
      id: form.id,
      title: form.title,
      body: form.body,
      severity: form.severity || 'info',
      active: form.active ?? true,
    });
    setForm(null);
  };

  const severityColor = { info: 'border-sky-200 bg-sky-50', warning: 'border-amber-200 bg-amber-50', critical: 'border-rose-200 bg-rose-50' };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <p className="text-sm text-slate-500">Banners for agents and the customer portal.</p>
        <button type="button" onClick={() => setForm({ title: '', body: '', severity: 'info', active: true })}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg"><Plus size={16} /> New</button>
      </div>
      {form && (
        <form onSubmit={submit} className="bg-white rounded-xl border p-5 space-y-3 shadow-sm">
          <input value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" required className="w-full px-3 py-2 text-sm border rounded-lg" />
          <textarea value={form.body || ''} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Body" required rows={3} className="w-full px-3 py-2 text-sm border rounded-lg" />
          <select value={form.severity || 'info'} onChange={(e) => setForm({ ...form, severity: e.target.value as Announcement['severity'] })} className="px-3 py-2 text-sm border rounded-lg bg-white">
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 text-sm text-white bg-sky-600 rounded-lg">Save</button>
            <button type="button" onClick={() => setForm(null)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
          </div>
        </form>
      )}
      <div className="space-y-3">
        {announcements.map((a) => (
          <div key={a.id} className={`rounded-xl border p-4 ${severityColor[a.severity]}`}>
            <div className="flex justify-between gap-2">
              <div>
                <div className="font-semibold text-slate-900">{a.title}</div>
                <p className="text-sm text-slate-600 mt-1">{a.body}</p>
                <div className="text-xs text-slate-400 mt-2 capitalize">{a.severity} · {a.active ? 'Active' : 'Inactive'}</div>
              </div>
              <button type="button" onClick={() => deleteAnnouncement(a.id)} className="text-slate-400 hover:text-rose-600"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
