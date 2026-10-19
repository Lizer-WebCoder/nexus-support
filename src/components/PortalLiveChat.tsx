import { useState, useEffect, useRef, useMemo } from 'react';
import clsx from 'clsx';
import { Send, ArrowLeft } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { INITIAL_BRANCHES } from '../data';

const STORAGE_KEY = 'nexus-portal-chat-id';

interface Props {
  onBack: () => void;
}

export default function PortalLiveChat({ onBack }: Props) {
  const { conversations, createChat, sendChatMessage, refreshPlatform } = usePlatform();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [branch, setBranch] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [chatId, setChatId] = useState<string | null>(() => sessionStorage.getItem(STORAGE_KEY));
  const [draft, setDraft] = useState('');
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const conversation = conversations.find((c) => c.id === chatId) || null;

  const branchOptions = useMemo(() => {
    const set = new Set(INITIAL_BRANCHES.map((b) => b.name));
    try {
      const raw = localStorage.getItem('nexus-branches-v1');
      if (raw) {
        const list = JSON.parse(raw) as { name: string }[];
        list.forEach((b) => set.add(b.name));
      }
    } catch {}
    return Array.from(set).sort();
  }, []);

  useEffect(() => {
    const t = setInterval(() => refreshPlatform(), 3000);
    return () => clearInterval(t);
  }, [refreshPlatform]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages?.length]);

  const start = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!branch.trim()) {
      setError('Please select your branch');
      return;
    }
    setError('');
    setStarting(true);
    try {
      const tid = ticketId.trim() || undefined;
      const c = await createChat(name.trim(), email.trim() || undefined, {
        branch: branch.trim(),
        ticket_id: tid,
      });
      sessionStorage.setItem(STORAGE_KEY, c.id);
      setChatId(c.id);

      // Opening message with context so agents don't need to ask
      const parts = [
        `Hi, I'm ${name.trim()}.`,
        `Branch: ${branch.trim()}.`,
      ];
      if (tid) parts.push(`Ticket to resolve: ${tid}.`);
      parts.push('I need help.');
      await sendChatMessage(c.id, parts.join(' '), 'customer');
    } finally {
      setStarting(false);
    }
  };

  const send = async () => {
    if (!draft.trim() || !chatId) return;
    const text = draft.trim();
    setDraft('');
    await sendChatMessage(chatId, text, 'customer');
  };

  const endAndLeave = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setChatId(null);
    onBack();
  };

  if (!chatId || !conversation) {
    return (
      <div className="max-w-md mx-auto">
        <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Live chat</h1>
        <p className="text-slate-500 text-sm mb-6">Chat with a support agent in real time.</p>
        <form onSubmit={start} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          {error && <div className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Your name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email (optional)</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Branch *</label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            >
              <option value="">Select your branch…</option>
              {branchOptions.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ticket number (if any)</label>
            <input
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              placeholder="e.g. NX-2841"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            />
            <p className="text-[11px] text-slate-400 mt-1">If you already submitted a request, enter the ticket ID so we can help faster.</p>
          </div>
          <button type="submit" disabled={starting}
            className="w-full py-2.5 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-700 disabled:opacity-50">
            {starting ? 'Connecting…' : 'Start chat'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col h-[calc(100vh-8rem)] min-h-[400px]">
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft size={16} /> Back
        </button>
        <button type="button" onClick={endAndLeave} className="text-xs text-slate-400 hover:text-rose-600">
          End session
        </button>
      </div>
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="text-sm font-semibold text-slate-900">Support chat</div>
          <div className="text-xs text-slate-500 capitalize">
            {conversation.status === 'waiting' ? 'Waiting for agent…' : conversation.status}
            {conversation.branch ? ` · ${conversation.branch}` : ''}
            {conversation.ticket_id ? ` · Ticket ${conversation.ticket_id}` : ''}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {(conversation.messages || []).map((m) => (
            <div key={m.id} className={clsx('flex', m.sender === 'customer' ? 'justify-end' : 'justify-start')}>
              <div className={clsx(
                'max-w-[80%] rounded-2xl px-4 py-2 text-sm',
                m.sender === 'customer' ? 'bg-sky-600 text-white rounded-br-md' : 'bg-slate-100 text-slate-800 rounded-bl-md'
              )}>
                {m.sender === 'agent' && <div className="text-[10px] font-semibold text-slate-500 mb-0.5">Agent</div>}
                {m.text}
                <div className={clsx('text-[10px] mt-1', m.sender === 'customer' ? 'text-sky-200' : 'text-slate-400')}>
                  {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        {conversation.status !== 'ended' ? (
          <div className="p-3 border-t border-slate-100 flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Type your message…"
              className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            />
            <button type="button" onClick={send} disabled={!draft.trim()}
              className="px-4 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 disabled:opacity-40">
              <Send size={18} />
            </button>
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-slate-500">This chat was ended by the agent.</div>
        )}
      </div>
    </div>
  );
}
