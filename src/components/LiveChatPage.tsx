import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Send, Plus } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';

export default function LiveChatPage() {
  const { conversations, sendChatMessage, setChatStatus, createChat } = usePlatform();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (!selectedId && conversations[0]) setSelectedId(conversations[0].id);
  }, [conversations, selectedId]);

  const selected = conversations.find((c) => c.id === selectedId) || conversations[0];
  const activeCount = conversations.filter((c) => c.status !== 'ended').length;

  const send = async () => {
    if (!draft.trim() || !selected) return;
    await sendChatMessage(selected.id, draft.trim(), 'agent');
    setDraft('');
  };

  const newChat = async () => {
    const c = await createChat('Walk-in customer');
    setSelectedId(c.id);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex h-[calc(100vh-10rem)] min-h-[420px]">
      <div className="w-72 border-r border-slate-200 flex flex-col">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-800">Live chats ({activeCount})</span>
          <button type="button" onClick={newChat} className="p-1 text-sky-600 hover:bg-sky-50 rounded"><Plus size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && (
            <p className="text-xs text-slate-400 p-4 text-center">No conversations yet. Create one or wait for customers.</p>
          )}
          {conversations.map((c) => (
            <button key={c.id} type="button" onClick={() => setSelectedId(c.id)}
              className={clsx(
                'w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors',
                selectedId === c.id && 'bg-sky-50'
              )}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-800">{c.customer_name}</span>
                {c.unread > 0 && (
                  <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{c.unread}</span>
                )}
              </div>
              <div className="text-xs text-slate-500 truncate mt-0.5">{c.preview || 'No messages'}</div>
              <div className="text-[10px] mt-1 capitalize text-slate-400">{c.status}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {selected ? (
          <>
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">{selected.customer_name}</div>
                <div className="text-xs text-slate-500 capitalize">{selected.status}</div>
              </div>
              <select
                value={selected.status}
                onChange={(e) => setChatStatus(selected.id, e.target.value as 'active' | 'waiting' | 'ended')}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white"
              >
                <option value="waiting">Waiting</option>
                <option value="active">Active</option>
                <option value="ended">Ended</option>
              </select>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {(selected.messages || []).map((m) => (
                <div key={m.id} className={clsx('flex', m.sender === 'agent' ? 'justify-end' : 'justify-start')}>
                  <div className={clsx(
                    'max-w-[75%] rounded-2xl px-4 py-2 text-sm',
                    m.sender === 'agent' ? 'bg-sky-600 text-white rounded-br-md' : 'bg-slate-100 text-slate-800 rounded-bl-md'
                  )}>
                    {m.text}
                    <div className={clsx('text-[10px] mt-1', m.sender === 'agent' ? 'text-sky-200' : 'text-slate-400')}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
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
                <button type="button" onClick={send} disabled={!draft.trim()}
                  className="px-4 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 disabled:opacity-40">
                  <Send size={18} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Select or start a chat</div>
        )}
      </div>
    </div>
  );
}
