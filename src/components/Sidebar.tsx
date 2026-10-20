import {
  LayoutDashboard, Ticket, Building2, BookOpen, MessageSquare,
  BarChart3, UserCog, Zap, ClipboardList, ShieldCheck,
  Megaphone, FileText, Rocket, Settings, LogOut, User,
} from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  active: string;
  onNavigate: (id: string) => void;
  ticketCount?: number;
  chatCount?: number;
  userName?: string;
  userEmail?: string;
  onSignOut?: () => void;
  onProfile?: () => void;
}

function BrandMark({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <div className={`${className} rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-md shadow-brand-900/40`}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="3" fill="white" />
        <path
          d="M12 3a9 9 0 0 1 9 9"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.95"
        />
        <path
          d="M12 21a9 9 0 0 1-9-9"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.55"
        />
      </svg>
    </div>
  );
}

export default function Sidebar({
  active,
  onNavigate,
  ticketCount = 0,
  chatCount = 0,
  userName = 'Agent',
  userEmail = '',
  onSignOut,
  onProfile,
}: SidebarProps) {
  const initials = userName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AG';

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'tickets', label: 'Tickets', icon: Ticket, badge: ticketCount || undefined },
    { id: 'customers', label: 'Branches', icon: Building2 },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { id: 'chat', label: 'Live Chat', icon: MessageSquare, badge: chatCount || undefined, badgeColor: 'bg-emerald-500' },
  ];

  const managementItems = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'team', label: 'Team', icon: UserCog },
    { id: 'automations', label: 'Automations', icon: Zap },
  ];

  const toolItems = [
    { id: 'surveys', label: 'Surveys', icon: ClipboardList },
    { id: 'quality', label: 'Quality', icon: ShieldCheck },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'forms', label: 'Forms', icon: FileText },
    { id: 'releases', label: 'Releases', icon: Rocket },
  ];

  const renderItem = (item: (typeof navItems)[0]) => {
    const Icon = item.icon;
    const isActive = active === item.id;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => onNavigate(item.id)}
        className={clsx(
          'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-brand-500/15 text-white ring-1 ring-brand-400/30'
            : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'
        )}
      >
        <Icon size={18} className={clsx('shrink-0', isActive ? 'text-brand-300' : 'text-zinc-500')} />
        <span className="flex-1 text-left">{item.label}</span>
        {item.badge !== undefined && item.badge > 0 && (
          <span className={clsx(
            'text-[11px] font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
            item.badgeColor || 'bg-zinc-700 text-zinc-200',
            item.badgeColor ? 'text-white' : ''
          )}>
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className="w-60 bg-zinc-950 text-zinc-100 border-r border-zinc-800 flex flex-col h-screen sticky top-0">
      <div className="px-4 py-5 flex items-center gap-2.5">
        <BrandMark />
        <div>
          <div className="font-semibold text-white text-sm leading-tight tracking-tight">Nexus Ops</div>
          <div className="text-[11px] text-zinc-500 leading-tight">Support desk</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-6">
        <div>
          <div className="px-3 mb-1.5 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Workspace</div>
          <div className="space-y-0.5">{navItems.map(renderItem)}</div>
        </div>
        <div>
          <div className="px-3 mb-1.5 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Manage</div>
          <div className="space-y-0.5">{managementItems.map(renderItem)}</div>
        </div>
        <div>
          <div className="px-3 mb-1.5 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Tools</div>
          <div className="space-y-0.5">{toolItems.map(renderItem)}</div>
        </div>
      </nav>

      <div className="border-t border-zinc-800 p-3 space-y-1">
        <button
          type="button"
          onClick={() => onNavigate('settings')}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            active === 'settings'
              ? 'bg-brand-500/15 text-white'
              : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'
          )}
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>

        <button
          type="button"
          onClick={() => (onProfile ? onProfile() : onNavigate('profile'))}
          className={clsx(
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors',
            active === 'profile' ? 'bg-white/5' : 'hover:bg-white/5'
          )}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-xs font-semibold">
            {initials}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-sm font-medium text-zinc-100 truncate">{userName}</div>
            <div className="text-[11px] text-zinc-500 truncate">{userEmail}</div>
          </div>
          <User size={14} className="text-zinc-500 shrink-0" />
        </button>

        {onSignOut && (
          <button
            type="button"
            onClick={() => onSignOut()}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
          >
            <LogOut size={16} />
            Sign out
          </button>
        )}
      </div>
    </aside>
  );
}
