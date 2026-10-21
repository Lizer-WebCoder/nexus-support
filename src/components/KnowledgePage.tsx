import { useState, useMemo } from 'react';
import { Search, BookOpen, ChevronRight, Plus, Pencil, Trash2 } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';

export default function KnowledgePage() {
  const { articles, saveArticle, deleteArticle } = usePlatform();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [openId, setOpenId] = useState<string | null>(null);
  const [editing, setEditing] = useState<{
    id?: string;
    title: string;
    category: string;
    body: string;
    published: boolean;
  } | null>(null);

  const categories = ['All', ...Array.from(new Set(articles.map((a) => a.category || 'General')))];

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      if (category !== 'All' && (a.category || 'General') !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!a.title.toLowerCase().includes(q) && !a.body.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [articles, search, category]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    await saveArticle({
      id: editing.id,
      title: editing.title,
      category: editing.category,
      body: editing.body,
      published: editing.published,
    } as { id?: string; title: string; category: string; body: string });
    // published stored via extended save if platform supports — patch local update path
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3 text-sm text-brand-900">
        Published articles appear on the <strong>Customer Portal → Help</strong>. Drafts stay agent-only.
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search knowledge base..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  category === c ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditing({ title: '', category: 'General', body: '', published: true })}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700"
        >
          <Plus size={16} /> New article
        </button>
      </div>

      {editing && (
        <form onSubmit={submit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="text-sm font-semibold text-slate-800">{editing.id ? 'Edit article' : 'New article'}</div>
          <input
            value={editing.title}
            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            required
            placeholder="Title"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
          />
          <input
            value={editing.category}
            onChange={(e) => setEditing({ ...editing, category: e.target.value })}
            placeholder="Category"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
          />
          <textarea
            value={editing.body}
            onChange={(e) => setEditing({ ...editing, body: e.target.value })}
            required
            rows={5}
            placeholder="Article body"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
          />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={editing.published}
              onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
            />
            Published on customer portal
          </label>
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
        {filtered.length === 0 && <div className="p-12 text-center text-slate-500">No articles match</div>}
        {filtered.map((a) => (
          <div key={a.id}>
            <div className="flex items-center gap-2 px-5 py-3 hover:bg-slate-50">
              <button type="button" onClick={() => setOpenId(openId === a.id ? null : a.id)} className="flex-1 flex items-center gap-3 text-left">
                <BookOpen size={18} className="text-brand-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 flex items-center gap-2">
                    {a.title}
                    {a.published === false && (
                      <span className="text-[10px] font-semibold uppercase text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Draft</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{a.category || 'General'}</div>
                </div>
                <ChevronRight size={16} className={`text-slate-300 transition-transform ${openId === a.id ? 'rotate-90' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() =>
                  setEditing({
                    id: a.id,
                    title: a.title,
                    category: a.category || 'General',
                    body: a.body,
                    published: a.published !== false,
                  })
                }
                className="p-1.5 text-slate-400 hover:text-brand-600"
              >
                <Pencil size={14} />
              </button>
              <button type="button" onClick={() => deleteArticle(a.id)} className="p-1.5 text-slate-400 hover:text-rose-600">
                <Trash2 size={14} />
              </button>
            </div>
            {openId === a.id && (
              <div className="px-5 pb-4 pl-12">
                <pre className="text-sm text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">{a.body}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
