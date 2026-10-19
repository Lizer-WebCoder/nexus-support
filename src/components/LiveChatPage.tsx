import { useState } from 'react';
import clsx from 'clsx';
import { Send } from 'lucide-react';

interface Chat {
  id: string;
  customer: string;
  preview: string;
  unread: number;
  status: 'active' | 'waiting' | 'ended';
  messages: { from: 'agent' | 'customer'; text: string; time: string }[];
}

const INITIAL: Chat[] = [
  {
    id: 'c1', customer: 'TechNova Inc', preview: 'SSO still failing after the cert update',
    unread: 2, status: 'active',
    messages: [
      { from: 'customer', text: 'Hi, our Okta SSO started failing this morning.', time: '10:12' },
      { from: 'agent', text: 'Thanks for reaching out. Can you share the error code from the login page?', time: '10:13' },
      { from: 'customer', text: 'It says "invalid_request" after redirect.', time: '10:14' },
      { from: 'customer', text: 'SSO still failing after the cert update', time: '10:18' },
    ],
  },
  {
    id: 'c2', customer: 'MobileFirst Co', preview: 'App still crashes on launch',
    unread: 1, status: 'waiting',
    messages: [
      { from: 'customer', text: 'We updated to 3.2.1 and it crashes on iOS 18.', time: '09:40' },
      { from: 'agent', text: 'We are tracking this. Can you send the crash log?', time: '09:42' },
      { from: 'customer', text: 'App still crashes on launch', time: '09:55' },
    ],
  },
  {
    id: 'c3', customer: 'Acme Corp', preview: 'Thanks, that fixed the invoice',
    unread: 0, status: 'ended',
    messages: [
      { from: 'customer', text: 'Invoice #4821 has the wrong tax amount.', time: 'Yesterday' },
      { from: 'agent', text: 'Corrected and reissued. You should see a credit on the next statement.', time: 'Yesterday' },
      { from: 'customer', text: 'Thanks, that fixed the invoice', time: 'Yesterday' },
    ],
  },
  {
    id: 'c4', customer: 'DataFlow Systems', preview: 'Need higher API rate limit',
    unread: 1, status: 'active',
    messages: [
      { from: 'customer', text: 'We are hitting 429s during peak. Can we raise the limit?', time: '11:02' },
    ],
  },
];

export default function LiveChatPage() {
  const [chats, setChats] = useState(INITIAL);
  const [selectedId, setSelectedId] = useState('c1');
  const [draft, setDraft] = useState('');

  const selected = chats.find((c) => c.id === selectedId) || chats[0];

  const send = () => {
    if (!draft.trim() || !selected) return;
    const msg = { from: 'agent' as const, text: draft.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChats((prev) =>
      prev.map((c) =>
        c.id === selected.id
          ? { ...c, messages: [...c.messages, msg], preview: msg.text, unread: 0 }
          : c
      )
    );
    setDraft('');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex h-[calc(100vh-10rem)] min-h-[420px]">
      {/* List */}
      <div className="w-72 border-r border-slate-200 flex flex-col">
        <div className="px-4 py-3 border-b border-slate-200 text-sm font-semibold text-slate-800">
          Live chats ({chats.filter((c) => c.status !== 'ended').length})
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.map((c) => (
            <button key={c.id} onClick={() => setSelectedId(c.id)}
              className={clsx(
                'w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors',
                selectedId === c.id && 'bg-sky-50'
              )}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-800">{c.customer}</span>
                {c.unread > 0 && (
                  <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{c.unread}</span>
                )}
              </div>
              <div className="text-xs text-slate-500 truncate mt-0.5">{c.preview}</div>
              <div className="text-[10px] mt-1 capitalize text-slate-400">{c.status}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Thread */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">{selected.customer}</div>
            <div className="text-xs text-slate-500 capitalize">{selected.status}</div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {selected.messages.map((m, i) => (
            <div key={i} className={clsx('flex', m.from === 'agent' ? 'justify-end' : 'justify-start')}>
              <div className={clsx(
                'max-w-[75%] rounded-2xl px-4 py-2 text-sm',
                m.from === 'agent' ? 'bg-sky-600 text-white rounded-br-md' : 'bg-slate-100 text-slate-800 rounded-bl-md'
              )}>
                {m.text}
                <div className={clsx('text-[10px] mt-1', m.from === 'agent' ? 'text-sky-200' : 'text-slate-400')}>{m.time}</div>
              </div>
            </div>
          ))}
        </div>
        {selected.status !== 'ended' && (
          <div className="p-4 border-t border-slate-200 flex gap-2">
            <input value={draft} onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Type a reply..."
              className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30" />
            <button onClick={send} disabled={!draft.trim()}
              className="px-4 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 disabled:opacity-40">
              <Send size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
