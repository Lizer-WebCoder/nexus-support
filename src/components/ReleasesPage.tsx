import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';

export default function ReleasesPage() {
  const { releases, saveRelease, deleteRelease } = usePlatform();
  const [version, setVersion] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveRelease({ version: version.trim(), title: title.trim(), notes: notes.trim() });
    setVersion('');
    setTitle('');
    setNotes('');
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">Product release notes for support agents.</p>
      <form onSubmit={add} className="bg-white rounded-xl border p-5 shadow-sm space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="Version e.g. 1.3.0" required className="px-3 py-2 text-sm border rounded-lg" />
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required className="px-3 py-2 text-sm border rounded-lg" />
        </div>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Release notes" rows={3} className="w-full px-3 py-2 text-sm border rounded-lg" />
        <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white bg-sky-600 rounded-lg"><Plus size={16} /> Publish</button>
      </form>
      <div className="space-y-3">
        {releases.map((r) => (
          <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">{r.version}</span>
                <span className="font-semibold text-slate-900">{r.title}</span>
              </div>
              <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{r.notes}</p>
              <div className="text-xs text-slate-400 mt-2">{new Date(r.released_at).toLocaleString()}</div>
            </div>
            <button type="button" onClick={() => deleteRelease(r.id)} className="text-slate-400 hover:text-rose-600 shrink-0"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
