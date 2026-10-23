import { useMemo } from 'react';
import {
  BookOpen,
  Users,
  Megaphone,
  LifeBuoy,
  Ticket,
  MessageSquare,
  Search,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

type Props = {
  displayName: string;
  onNavigate: (view: 'community' | 'help' | 'submit' | 'chat' | 'track' | 'mytickets') => void;
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

const QUICK = [
  {
    id: 'submit' as const,
    label: 'Submit request',
    hint: 'Open a ticket',
    icon: Ticket,
    accent: 'from-violet-500/20 to-fuchsia-500/10 text-violet-600',
  },
  {
    id: 'chat' as const,
    label: 'Live chat',
    hint: 'Talk to an agent',
    icon: MessageSquare,
    accent: 'from-sky-500/20 to-cyan-500/10 text-sky-600',
  },
  {
    id: 'track' as const,
    label: 'Track ticket',
    hint: 'Check status',
    icon: Search,
    accent: 'from-amber-500/20 to-orange-500/10 text-amber-600',
  },
  {
    id: 'help' as const,
    label: 'Help articles',
    hint: 'Self-serve guides',
    icon: BookOpen,
    accent: 'from-emerald-500/20 to-teal-500/10 text-emerald-600',
  },
];

function AmbientField() {
  const dots = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: `${(i * 37 + 9) % 100}%`,
        top: `${(i * 53 + 17) % 100}%`,
        size: i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1.5,
        delay: `${(i * 0.4) % 5}s`,
        duration: `${9 + (i % 6) * 1.3}s`,
      })),
    [],
  );

  return (
    <div className="portal-home-ambient" aria-hidden>
      <div className="portal-home-nebula portal-home-nebula-a" />
      <div className="portal-home-nebula portal-home-nebula-b" />
      <div className="portal-home-stars">
        {dots.map((d) => (
          <span
            key={d.id}
            className="portal-home-star"
            style={{
              left: d.left,
              top: d.top,
              width: d.size,
              height: d.size,
              animationDelay: d.delay,
              animationDuration: d.duration,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function PortalHome({ displayName, onNavigate }: Props) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="portal-home relative">
      <AmbientField />

      <div className="relative z-10 space-y-4 max-w-4xl">
        {/* Hero */}
        <div className="portal-home-hero rounded-2xl px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-violet-600/90 mb-1.5">
                <Sparkles size={12} />
                Customer portal
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 tracking-tight">
                {greeting}, {displayName}
              </h1>
              <p className="text-sm text-zinc-500 mt-1 max-w-xl leading-snug">
                Self-serve help and peer support — open a ticket only when you need the desk.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('community')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 shadow-md shadow-violet-900/20 shrink-0"
            >
              <Users size={16} />
              Community
              <ArrowRight size={14} className="opacity-80" />
            </button>
          </div>
        </div>

        {/* Quick actions — denser 4-up */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {QUICK.map((q) => {
            const Icon = q.icon;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => onNavigate(q.id)}
                className="portal-home-card group text-left rounded-xl border border-zinc-200/80 bg-white/90 backdrop-blur-sm p-3.5 hover:border-violet-300/80 hover:shadow-md transition-all"
              >
                <div
                  className={`w-9 h-9 rounded-lg bg-gradient-to-br ${q.accent} flex items-center justify-center mb-2.5`}
                >
                  <Icon size={17} />
                </div>
                <div className="text-sm font-semibold text-zinc-900 group-hover:text-violet-700 transition-colors">
                  {q.label}
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5">{q.hint}</p>
              </button>
            );
          })}
        </div>

        {/* Community spotlight */}
        <div className="portal-home-card rounded-xl border border-violet-200/60 bg-gradient-to-br from-violet-50/90 via-white/90 to-white/90 backdrop-blur-sm p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
              <Users size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-zinc-900">Customer community</h2>
              <p className="text-xs sm:text-sm text-zinc-600 mt-1 leading-relaxed">
                Chat with other customers about issues, workarounds, and tips — without creating a ticket.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('community')}
                className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700"
              >
                <Users size={14} /> Open community chat
              </button>
            </div>
          </div>
        </div>

        {/* Two info cards */}
        <div className="grid sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('help')}
            className="portal-home-card text-left rounded-xl border border-zinc-200/80 bg-white/90 backdrop-blur-sm p-4 hover:border-violet-300 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center mb-2">
              <BookOpen size={16} />
            </div>
            <div className="text-sm font-semibold text-zinc-900">Help articles</div>
            <p className="text-xs text-zinc-500 mt-1 leading-snug">
              Guides and FAQs you can use without waiting on an agent.
            </p>
          </button>
          <div className="portal-home-card rounded-xl border border-zinc-200/80 bg-white/90 backdrop-blur-sm p-4">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center mb-2">
              <LifeBuoy size={16} />
            </div>
            <div className="text-sm font-semibold text-zinc-900">When to contact support</div>
            <p className="text-xs text-zinc-500 mt-1 leading-snug">
              Use <span className="font-medium text-zinc-700">Submit request</span> or{' '}
              <span className="font-medium text-zinc-700">Live chat</span> for account-specific or urgent issues.
            </p>
          </div>
        </div>

        {/* Helpful to know — tighter rows */}
        <div className="portal-home-card rounded-xl border border-zinc-200/80 bg-white/90 backdrop-blur-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-100/80">
            <Megaphone size={15} className="text-zinc-400" />
            <h2 className="text-sm font-semibold text-zinc-900">Helpful to know</h2>
          </div>
          <ul className="divide-y divide-zinc-100/80">
            {HIGHLIGHTS.map((h) => (
              <li key={h.title} className="px-4 py-3">
                <div className="text-sm font-medium text-zinc-900">{h.title}</div>
                <p className="text-xs text-zinc-500 mt-0.5 leading-snug">{h.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
