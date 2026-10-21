import { useState } from 'react';
import { Plus, Pencil, Trash2, MessageSquareText } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';

export default function MacrosPage() {
  const { canned, saveCanned, deleteCanned } = usePlatform();
  const [editing, setEditing] = useState<{ id?: string; title: string; body: string; shortcut: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.title.trim() || !editing.body.trim()) return;
    await saveCanned({
      id: editing.id,
      title: editing.title.trim(),
      body: editing.body.trim(),
      shortcut: editing.shortcut.trim() || undefined,
    });
    setEditing(null);
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3 text-sm text-brand-900">
        <strong>Macros</strong> are canned replies. Use them on ticket replies and live chat. Optional shortcuts like{' '}
        <code className="bg-white/80 px-1 rounded">/hi</code> appear as quick chips.
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <MessageSquareText size={16} /> Canned responses ({canned.length})
        </h2>
        <button
          type="button"
          onClick={() => setEditing({ title: '', body: '', shortcut: '' })}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700"
        >
          <Plus size={16} /> New macro
        </button>
      </div>

      {editing && (
        <form onSubmit={submit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="text-sm font-semibold text-slate-800">{editing.id ? 'Edit macro' : 'New macro'}</div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500">Title *</label>
              <input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                required
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                placeholder="Greeting"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Shortcut</label>
              <input
                value={editing.shortcut}
                onChange={(e) => setEditing({ ...editing, shortcut: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono"
                placeholder="/hi"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500">Body *</label>
            <textarea
              value={editing.body}
              onChange={(e) => setEditing({ ...editing, body: e.target.value })}
              required
              rows={4}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              placeholder="Hi! Thanks for contacting support…"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg">
              Save
            </button>
            <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        {canned.length === 0 && <p className="p-8 text-center text-sm text-slate-400">No macros yet</p>}
        {canned.map((c) => (
          <div key={c.id} className="px-5 py-3 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-800">
                {c.title}
                {c.shortcut && (
                  <span className="ml-2 font-mono text-[11px] text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">{c.shortcut}</span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{c.body}</p>
            </div>
            <button
              type="button"
              onClick={() => setEditing({ id: c.id, title: c.title, body: c.body, shortcut: c.shortcut || '' })}
              className="p-1.5 text-slate-400 hover:text-brand-600"
            >
              <Pencil size={14} />
            </button>
            <button type="button" onClick={() => deleteCanned(c.id)} className="p-1.5 text-slate-400 hover:text-rose-600">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
