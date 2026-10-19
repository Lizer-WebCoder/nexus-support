import {
  LayoutDashboard, Ticket, Users, BookOpen, MessageSquare,
  BarChart3, UserCog, Zap, ClipboardList, ShieldCheck,
  Megaphone, FileText, Rocket, Settings, ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  active: string;
  onNavigate: (id: string) => void;
  ticketCount?: number;
}

export default function Sidebar({ active, onNavigate, ticketCount = 0 }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'tickets', label: 'Tickets', icon: Ticket, badge: ticketCount || undefined },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { id: 'chat', label: 'Live Chat', icon: MessageSquare, badge: 4, badgeColor: 'bg-emerald-500' },
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
        onClick={() => onNavigate(item.id)}
        className={clsx(
          'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        )}
      >
        <Icon size={18} className="shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        {item.badge !== undefined && (
          <span className={clsx(
            'text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
            item.badgeColor || 'bg-slate-200 text-slate-700',
            item.badgeColor ? 'text-white' : ''
          )}>
            {item.badge}
          </span>
        )}
        {!item.badge && !isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
      </button>
    );
  };

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="px-4 py-5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center shadow-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div>
          <div className="font-semibold text-slate-900 text-sm leading-tight">Nexus</div>
          <div className="text-[11px] text-slate-500 leading-tight">Support Platform</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-6">
        <div>
          <div className="px-3 mb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Navigation</div>
          <div className="space-y-0.5">{navItems.map(renderItem)}</div>
        </div>
        <div>
          <div className="px-3 mb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Management</div>
          <div className="space-y-0.5">{managementItems.map(renderItem)}</div>
        </div>
        <div>
          <div className="px-3 mb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tools</div>
          <div className="space-y-0.5">{toolItems.map(renderItem)}</div>
        </div>
      </nav>

      <div className="border-t border-slate-200 p-3 space-y-1">
        <button
          onClick={() => onNavigate('settings')}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            active === 'settings' ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>
        <div className="flex items-center gap-2.5 px-3 py-2 mt-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center text-white text-xs font-semibold">SC</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-900 truncate">Sarah Chen</div>
            <div className="text-[11px] text-slate-500 truncate">sarah@nexus.support</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
