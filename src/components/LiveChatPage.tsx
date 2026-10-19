import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { Send, Plus, Trash2, UserRound, RotateCcw, Paperclip } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { MAX_CHAT_FILE_BYTES } from '../types';
import { encodeChatAttachment, parseChatAttachment, isImageMime } from '../lib/chatAttachments';

export default function LiveChatPage() {
  const {
    conversations,
    sendChatMessage,
    setChatStatus,
    createChat,
    deleteChat,
    refreshPlatform,
  } = usePlatform();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [newName, setNewName] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fileError, setFileError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedId && conversations[0]) setSelectedId(conversations[0].id);
  }, [conversations, selectedId]);

  useEffect(() => {
    const t = setInterval(() => {
      refreshPlatform();
    }, 4000);
    return () => clearInterval(t);
  }, [refreshPlatform]);

  const selected = conversations.find((c) => c.id === selectedId) || null;
  const activeCount = conversations.filter((c) => c.status !== 'ended').length;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selected?.messages?.length, selectedId]);

  const send = async (as: 'agent' | 'customer' = 'agent') => {
    if (!draft.trim() || !selected) return;
    setBusy(true);
    try {
      if (selected.status === 'ended') {
        await setChatStatus(selected.id, 'active');
      }
      await sendChatMessage(selected.id, draft.trim(), as);
      setDraft('');
    } finally {
      setBusy(false);
    }
  };

  const sendFile = async (file: File) => {
    if (!selected) return;
    setFileError('');
    if (file.size > MAX_CHAT_FILE_BYTES) {
      setFileError(`File too large (max ~${Math.round(MAX_CHAT_FILE_BYTES / 1000)}KB).`);
      return;
    }
    setBusy(true);
    try {
      if (selected.status === 'ended') await setChatStatus(selected.id, 'active');
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('read failed'));
        reader.readAsDataURL(file);
      });
      const body = encodeChatAttachment(
        { url: dataUrl, name: file.name, mime: file.type || 'application/octet-stream' },
        draft.trim() || undefined
      );
      setDraft('');
      await sendChatMessage(selected.id, body, 'agent');
    } finally {
      setBusy(false);
    }
  };

  const startChat = async () => {
    const name = newName.trim() || 'Walk-in customer';
    setBusy(true);
    try {
      const c = await createChat(name);
      setSelectedId(c.id);
      setNewName('');
      setShowNew(false);
      await sendChatMessage(c.id, 'Hi! An agent will be with you shortly. How can we help?', 'agent');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this conversation and all messages?')) return;
    setBusy(true);
    try {
      await deleteChat(id);
      if (selectedId === id) setSelectedId(null);
    } finally {
      setBusy(false);
    }
  };

  const reopen = async () => {
    if (!selected) return;
    await setChatStatus(selected.id, 'active');
  };

  return (
    <div className="space-y-3">
      <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-3 text-sm text-sky-800">
        <strong>How chat works:</strong> Customers enter <strong>ticket number</strong> first (branch auto-fills),
        then chat. Both sides can send <strong>images/files</strong> with the paperclip button.
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex h-[calc(100vh-12rem)] min-h-[420px]">
        <div className="w-72 border-r border-slate-200 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-slate-800">Live chats ({activeCount})</span>
            <button type="button" onClick={() => setShowNew((v) => !v)} className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg" title="New chat">
              <Plus size={16} />
            </button>
          </div>

          {showNew && (
            <div className="p-3 border-b border-slate-100 space-y-2 bg-slate-50">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Customer name"
                className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg"
                onKeyDown={(e) => e.key === 'Enter' && startChat()}
              />
              <button type="button" disabled={busy} onClick={startChat}
                className="w-full py-1.5 text-xs font-medium text-white bg-sky-600 rounded-lg disabled:opacity-50">
                Start conversation
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 && (
              <p className="text-xs text-slate-400 p-4 text-center">
                No chats yet. Ask a customer to use the portal Live chat, or click + to start one.
              </p>
            )}
            {conversations.map((c) => (
              <div
                key={c.id}
                className={clsx(
                  'group border-b border-slate-100',
                  selectedId === c.id && 'bg-sky-50'
                )}
              >
                <button
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-slate-800 truncate">{c.customer_name}</span>
                    {c.unread > 0 && (
                      <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{c.unread}</span>
                    )}
                  </div>
                  {(c.branch || c.ticket_id) && (
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {c.branch || '—'}
                      {c.ticket_id ? ` · ${c.ticket_id}` : ''}
                    </div>
                  )}
                  <div className="text-xs text-slate-500 truncate mt-0.5">
                    {c.preview?.startsWith('__ATT__') ? '📎 Attachment' : (c.preview || 'No messages')}
                  </div>
                  <div className={clsx(
                    'text-[10px] mt-1 capitalize',
                    c.status === 'ended' ? 'text-slate-400' : c.status === 'waiting' ? 'text-amber-600' : 'text-emerald-600'
                  )}>
                    {c.status}
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {selected ? (
            <>
              <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900">{selected.customer_name}</div>
                  <div className="text-xs text-slate-500">
                    {selected.customer_email || 'No email'} · <span className="capitalize">{selected.status}</span>
                  </div>
                  {(selected.branch || selected.ticket_id) && (
                    <div className="text-xs text-sky-700 mt-1 font-medium">
                      {selected.branch && <span>Branch: {selected.branch}</span>}
                      {selected.branch && selected.ticket_id && <span> · </span>}
                      {selected.ticket_id && <span>Ticket: {selected.ticket_id}</span>}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selected.status}
                    onChange={(e) => setChatStatus(selected.id, e.target.value as 'active' | 'waiting' | 'ended')}
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
                  >
                    <option value="waiting">Waiting</option>
                    <option value="active">Active</option>
                    <option value="ended">Ended</option>
                  </select>
                  {selected.status === 'ended' && (
                    <button type="button" onClick={reopen} className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 px-2 py-1.5 rounded-lg hover:bg-sky-50">
                      <RotateCcw size={12} /> Reopen
                    </button>
                  )}
                  <button type="button" onClick={() => remove(selected.id)} disabled={busy}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg" title="Delete chat">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {(selected.messages || []).length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-8">No messages yet. Send a greeting or wait for the customer.</p>
                )}
                {(selected.messages || []).map((m) => {
                  const { att, text } = parseChatAttachment(m.text);
                  return (
                    <div key={m.id} className={clsx('flex', m.sender === 'agent' ? 'justify-end' : 'justify-start')}>
                      <div className={clsx(
                        'max-w-[75%] rounded-2xl px-4 py-2 text-sm',
                        m.sender === 'agent' ? 'bg-sky-600 text-white rounded-br-md' : 'bg-slate-100 text-slate-800 rounded-bl-md'
                      )}>
                        {m.sender === 'customer' && (
                          <div className="text-[10px] font-semibold opacity-70 mb-0.5">Customer</div>
                        )}
                        {att && isImageMime(att.mime) && (
                          <a href={att.url} target="_blank" rel="noreferrer" className="block mb-2">
                            <img src={att.url} alt={att.name || 'image'} className="max-w-full rounded-lg max-h-52 object-contain" />
                          </a>
                        )}
                        {att && !isImageMime(att.mime) && (
                          <a
                            href={att.url}
                            download={att.name || 'file'}
                            className={clsx('block text-xs underline mb-1', m.sender === 'agent' ? 'text-sky-100' : 'text-sky-700')}
                          >
                            📎 {att.name || 'Download file'}
                          </a>
                        )}
                        {text}
                        <div className={clsx('text-[10px] mt-1', m.sender === 'agent' ? 'text-sky-200' : 'text-slate-400')}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <div className="p-4 border-t border-slate-200 space-y-2">
                {selected.status === 'ended' && (
                  <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                    This chat is ended. Click <strong>Reopen</strong> or send a message to continue.
                  </p>
                )}
                {fileError && <p className="text-xs text-rose-600">{fileError}</p>}
                <div className="flex gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,.pdf,.txt,.log,.zip,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) sendFile(f);
                      e.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={busy}
                    className="px-3 py-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 disabled:opacity-40"
                    title="Send image or file"
                  >
                    <Paperclip size={18} />
                  </button>
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send('agent')}
                    placeholder="Type a reply as agent…"
                    className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                  />
                  <button type="button" onClick={() => send('agent')} disabled={!draft.trim() || busy}
                    className="px-4 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 disabled:opacity-40" title="Send as agent">
                    <Send size={18} />
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={!draft.trim() || busy}
                    onClick={() => send('customer')}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <UserRound size={12} /> Simulate customer message
                  </button>
                  <span className="text-[11px] text-slate-400 self-center">Uses the text in the box above</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm p-6 text-center">
              Select a chat or start a new one. Customers join via Customer portal → Live chat.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
