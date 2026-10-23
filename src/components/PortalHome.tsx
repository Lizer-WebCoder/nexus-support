import { BookOpen, Users, Megaphone, LifeBuoy } from 'lucide-react';

type Props = {
  displayName: string;
  onNavigate: (view: 'community' | 'help' | 'submit' | 'chat') => void;
};

const HIGHLIGHTS = [
  {
    title: 'Password & account access',
    body: 'Try Account settings first. Many login issues clear after a password reset.',
  },
  {
    title: 'Before you open a ticket',
    body: 'Check Community — other customers often share workarounds for known issues.',
  },
  {
    title: 'Branch context helps',
    body: 'If you do need support, mention your branch so the right team can help faster.',
  },
];

export default function PortalHome({ displayName, onNavigate }: Props) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
          {greeting}, {displayName}
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Your space for self-serve help and peer support — open a ticket only when you need the desk.
        </p>
      </div>

      <div className="rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-zinc-900">Customer community</h2>
            <p className="text-sm text-zinc-600 mt-1 leading-relaxed">
              Chat with other customers about issues, workarounds, and tips — without creating a ticket.
              Great for “has anyone else seen this?” conversations.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('community')}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"
            >
              <Users size={16} /> Open community chat
            </button>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onNavigate('help')}
          className="text-left bg-white rounded-xl border border-zinc-200 shadow-sm p-5 hover:border-violet-300 transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center mb-3">
            <BookOpen size={18} />
          </div>
          <div className="text-sm font-semibold text-zinc-900">Help articles</div>
          <p className="text-xs text-zinc-500 mt-1">Guides and FAQs you can use without waiting on an agent.</p>
        </button>
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
          <div className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center mb-3">
            <LifeBuoy size={18} />
          </div>
          <div className="text-sm font-semibold text-zinc-900">When to contact support</div>
          <p className="text-xs text-zinc-500 mt-1">
            Use <span className="font-medium text-zinc-700">Submit request</span> or{' '}
            <span className="font-medium text-zinc-700">Live chat</span> in the sidebar for account-specific or urgent issues.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-zinc-100">
          <Megaphone size={16} className="text-zinc-400" />
          <h2 className="text-sm font-semibold text-zinc-900">Helpful to know</h2>
        </div>
        <ul className="divide-y divide-zinc-100">
          {HIGHLIGHTS.map((h) => (
            <li key={h.title} className="px-5 py-4">
              <div className="text-sm font-medium text-zinc-900">{h.title}</div>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{h.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
