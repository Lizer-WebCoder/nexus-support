import { useState } from 'react';
import { Search, Bell, Settings2 } from 'lucide-react';
import Sidebar from './components/Sidebar';
import MetricBar from './components/MetricBar';
import TicketPulse from './components/TicketPulse';
import Distribution from './components/Distribution';
import ChannelMix from './components/ChannelMix';
import MyQueue from './components/MyQueue';
import TeamStatus from './components/TeamStatus';

export default function App() {
  const [activeNav, setActiveNav] = useState('dashboard');

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar active={activeNav} onNavigate={setActiveNav} />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-lg font-semibold text-slate-900">Command Center</h1>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tickets, customers..."
                className="pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
              />
            </div>
            <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            </button>
            <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
              <Settings2 size={18} />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {activeNav === 'dashboard' ? (
            <>
              <MetricBar />
              <TicketPulse />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Distribution />
                <ChannelMix />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <MyQueue />
                <TeamStatus />
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
              <h2 className="text-xl font-semibold text-slate-800 capitalize mb-2">
                {activeNav.replace('-', ' ')}
              </h2>
              <p className="text-slate-500 max-w-md mx-auto">
                This section is ready for expansion. The Overview dashboard is fully interactive with live metrics, charts, and ticket queues.
              </p>
              <button
                onClick={() => setActiveNav('dashboard')}
                className="mt-6 px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 transition-colors"
              >
                Back to Overview
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
