import { useState, useMemo } from 'react';
import { Search, BookOpen, ChevronRight } from 'lucide-react';

const ARTICLES = [
  { id: 'kb-1', title: 'How to reset a customer password', category: 'Account', body: '1. Open the customer profile.\n2. Click Security → Reset password.\n3. An email is sent automatically. Link expires in 24 hours.' },
  { id: 'kb-2', title: 'SSO / Okta troubleshooting', category: 'Auth', body: 'Common causes:\n- Clock skew on IdP\n- Incorrect ACS URL\n- User not assigned to the app in Okta\n\nCheck the auth logs under Settings → SSO for the exact error code.' },
  { id: 'kb-3', title: 'Billing mismatch checklist', category: 'Billing', body: '1. Confirm plan and seat count in Billing.\n2. Check for pending invoices.\n3. Verify tax settings for the region.\n4. If double-charged, issue a credit memo from Finance tools.' },
  { id: 'kb-4', title: 'API rate limits', category: 'API', body: 'Default limits:\n- Free: 60 req/min\n- Pro: 600 req/min\n- Enterprise: custom\n\n429 responses include Retry-After. Burst allowance is 2× for 10 seconds.' },
  { id: 'kb-5', title: 'Mobile app crash on iOS 18', category: 'Mobile', body: 'Known issue in v3.2.1. Workaround: force-quit and clear app cache.\nFix ships in v3.2.2 (ETA this week). Ask customer for device model and OS build.' },
  { id: 'kb-6', title: 'Exporting tickets to CSV', category: 'Product', body: 'Tickets → Filters → Export.\nColumns included: ID, title, status, priority, channel, assignee, created, resolved.\nMax 10,000 rows per export.' },
  { id: 'kb-7', title: 'SLA policies overview', category: 'Support', body: 'Critical: first response 15 min, resolve 4h\nHigh: 1h / 8h\nMedium: 4h / 24h\nLow: 8h / 72h\n\nBusiness hours: Mon–Fri 09:00–18:00 local.' },
  { id: 'kb-8', title: 'Escalation path', category: 'Support', body: 'L1 → L2 (Senior) → Engineering on-call.\nEscalate critical after 30 min without progress.\nUse @oncall in Slack #support-escalations.' },
];

const CATEGORIES = ['All', ...Array.from(new Set(ARTICLES.map((a) => a.category)))];

export default function KnowledgePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return ARTICLES.filter((a) => {
      if (category !== 'All' && a.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!a.title.toLowerCase().includes(q) && !a.body.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [search, category]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search knowledge base..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                category === c ? 'bg-sky-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}>{c}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        {filtered.length === 0 && (
          <div className="p-12 text-center text-slate-500">No articles match</div>
        )}
        {filtered.map((a) => (
          <div key={a.id}>
            <button onClick={() => setOpenId(openId === a.id ? null : a.id)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors">
              <BookOpen size={18} className="text-sky-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800">{a.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">{a.category}</div>
              </div>
              <ChevronRight size={16} className={`text-slate-300 transition-transform ${openId === a.id ? 'rotate-90' : ''}`} />
            </button>
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
