import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { Send, Plus, Trash2, UserRound, RotateCcw, Paperclip, Ticket, ExternalLink } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { useTickets } from '../context/TicketContext';
import { MAX_CHAT_FILE_BYTES } from '../types';
import { encodeChatAttachment, parseChatAttachment, isImageMime } from '../lib/chatAttachments';
import { uploadAttachment } from '../lib/storage';
import { supabase } from '../lib/supabase';

export default function LiveChatPage() {
  const {
    conversations,
    sendChatMessage,
    setChatStatus,
    createChat,
    deleteChat,
    refreshPlatform,
  } = usePlatform();
  const { createTicket, findTicket } = useTickets();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [newName, setNewName] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fileError, setFileError] = useState('');
  const [msg, setMsg] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedId && conversations[0]) setSelectedId(conversations[0].id);
  }, [conversations, selectedId]);

  useEffect(() => {
    const t = setInterval(() => refreshPlatform(), 4000);
    return () => clearInterval(t);
  }, [refreshPlatform]);

  const selected = conversations.find((c) => c.id === selectedId) || null;
  const activeCount = conversations.filter((c) => c.status !== 'ended').length;
  const linkedTicket = selected?.ticket_id ? findTicket(selected.ticket_id) : undefined;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selected?.messages?.length, selectedId]);

  const linkTicketId = async (conversationId: string, ticketId: string) => {
    if (supabase) {
      await supabase.from('chat_conversations').update({ ticket_id: ticketId }).eq('id', conversationId);
    }
    await refreshPlatform();
  };

  const convertToTicket = async () => {
    if (!selected) return;
    setBusy(true);
    setMsg('');
    try {
      if (selected.ticket_id && findTicket(selected.ticket_id)) {
        setMsg(`Already linked to ${selected.ticket_id}`);
        return;
      }
      const transcript = (selected.messages || [])
        .map((m) => {
          const { text } = parseChatAttachment(m.text);
          const who = m.sender === 'agent' ? 'Agent' : 'Customer';
          return `[${who}] ${text || '(attachment)'}`;
        })
        .join('\n');
      const ticket = await createTicket({
        title: `Chat: ${selected.customer_name}`,
        description: transcript || 'Converted from live chat',
        priority: 'medium',
        channel: 'chat',
        customer_name: selected.customer_name,
        customer_email: selected.customer_email,
        branch: selected.branch,
      });
      await linkTicketId(selected.id, ticket.id);
      await sendChatMessage(
        selected.id,
        `We've opened ticket ${ticket.id} for this conversation. Our team will continue there as needed.`,
        'agent'
      );
      setMsg(`Created and linked ${ticket.id}`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Could not convert chat');
    } finally {
      setBusy(false);
    }
  };

  const send = async (as: 'agent' | 'customer' = 'agent') => {
    if (!draft.trim() || !selected) return;
    setBusy(true);
    try {
      if (selected.status === 'ended') await setChatStatus(selected.id, 'active');
      await sendChatMessage(selected.id, draft.trim(), as);
      setDraft('');
    } finally {
      setBusy(false);
    }
  };

  const sendFile = async (file: File) => {
    if (!selected) return;
    setFileError('');
    setBusy(true);
    try {
      if (selected.status === 'ended') await setChatStatus(selected.id, 'active');
      let url: string;
      let name = file.name;
      let mime = file.type || 'application/octet-stream';
      try {
        const up = await uploadAttachment(file, `chat/${selected.id}`);
        url = up.url;
        name = up.name;
        mime = up.mime;
      } catch {
        if (file.size > MAX_CHAT_FILE_BYTES) {
          setFileError(`File too large (max ~${Math.round(MAX_CHAT_FILE_BYTES / 1000)}KB without Storage).`);
          return;
        }
        url = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error('read failed'));
          reader.readAsDataURL(file);
        });
      }
      const body = encodeChatAttachment({ url, name, mime }, draft.trim() || undefined);
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

  return (
    <div className="space-y-3">
      <div className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 text-sm text-brand-800">
        <strong>Chat ↔ ticket:</strong> Convert a chat into a ticket, or open a linked ticket ID. Files use Supabase Storage when available.
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex h-[calc(100vh-12rem)] min-h-[420px]">
        <div className="w-72 border-r border-slate-200 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-slate-800">Live chats ({activeCount})</span>
            <button type="button" onClick={() => setShowNew((v) => !v)} className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg" title="New chat">
              <Plus size={16} />
            </button>
          </div>

          {showNew && (
            <div className="p-3 border-b border-slate-100 space-y-2 bg-slate-50">
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Customer name" className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg" onKeyDown={(e) => e.key === 'Enter' && startChat()} />
              <button type="button" disabled={busy} onClick={startChat} className="w-full py-1.5 text-xs font-medium text-white bg-brand-600 rounded-lg disabled:opacity-50">Start conversation</button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 && (
              <p className="text-xs text-slate-400 p-4 text-center">No chats yet. Customers use portal → Live chat.</p>
            )}
            {conversations.map((c) => (
              <div key={c.id} className={clsx('group border-b border-slate-100', selectedId === c.id && 'bg-brand-50')}>
                <button type="button" onClick={() => setSelectedId(c.id)} className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-slate-800 truncate">{c.customer_name}</span>
                    {c.unread > 0 && <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{c.unread}</span>}
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
                  <div className={clsx('text-[10px] mt-1 capitalize', c.status === 'ended' ? 'text-slate-400' : c.status === 'waiting' ? 'text-amber-600' : 'text-emerald-600')}>{c.status}</div>
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
                    <div className="text-xs text-brand-700 mt-1 font-medium">
                      {selected.branch && <span>Branch: {selected.branch}</span>}
                      {selected.branch && selected.ticket_id && <span> · </span>}
                      {selected.ticket_id && <span>Ticket: {selected.ticket_id}</span>}
                    </div>
                  )}
                  {msg && <div className="text-xs text-emerald-700 mt-1">{msg}</div>}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {selected.ticket_id ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 bg-brand-50 px-2 py-1.5 rounded-lg">
                      <Ticket size={12} /> {selected.ticket_id}
                      {linkedTicket && <span className="text-slate-500">· {linkedTicket.status}</span>}
                    </span>
                  ) : (
                    <button type="button" disabled={busy} onClick={convertToTicket} className="inline-flex items-center gap-1 text-xs font-medium text-white bg-brand-600 px-2.5 py-1.5 rounded-lg hover:bg-brand-700 disabled:opacity-50">
                      <Ticket size={12} /> Convert to ticket
                    </button>
                  )}
                  <select value={selected.status} onChange={(e) => setChatStatus(selected.id, e.target.value as 'active' | 'waiting' | 'ended')} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white">
                    <option value="waiting">Waiting</option>
                    <option value="active">Active</option>
                    <option value="ended">Ended</option>
                  </select>
                  {selected.status === 'ended' && (
                    <button type="button" onClick={() => setChatStatus(selected.id, 'active')} className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 px-2 py-1.5 rounded-lg hover:bg-brand-50">
                      <RotateCcw size={12} /> Reopen
                    </button>
                  )}
                  <button type="button" onClick={() => remove(selected.id)} disabled={busy} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg" title="Delete chat">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {(selected.messages || []).length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-8">No messages yet.</p>
                )}
                {(selected.messages || []).map((m) => {
                  const { att, text } = parseChatAttachment(m.text);
                  return (
                    <div key={m.id} className={clsx('flex', m.sender === 'agent' ? 'justify-end' : 'justify-start')}>
                      <div className={clsx('max-w-[75%] rounded-2xl px-4 py-2 text-sm', m.sender === 'agent' ? 'bg-brand-600 text-white rounded-br-md' : 'bg-slate-100 text-slate-800 rounded-bl-md')}>
                        {m.sender === 'customer' && <div className="text-[10px] font-semibold opacity-70 mb-0.5">Customer</div>}
                        {att && isImageMime(att.mime) && (
                          <a href={att.url} target="_blank" rel="noreferrer" className="block mb-2">
                            <img src={att.url} alt={att.name || 'image'} className="max-w-full rounded-lg max-h-52 object-contain" />
                          </a>
                        )}
                        {att && !isImageMime(att.mime) && (
                          <a href={att.url} download={att.name || 'file'} className={clsx('block text-xs underline mb-1', m.sender === 'agent' ? 'text-brand-100' : 'text-brand-700')}>📎 {att.name || 'Download file'}</a>
                        )}
                        {text}
                        <div className={clsx('text-[10px] mt-1', m.sender === 'agent' ? 'text-brand-200' : 'text-slate-400')}>
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
                  <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">Chat ended. Reopen or send a message to continue.</p>
                )}
                {fileError && <p className="text-xs text-rose-600">{fileError}</p>}
                <div className="flex gap-2">
                  <input ref={fileRef} type="file" accept="image/*,.pdf,.txt,.log,.zip,.doc,.docx" className="hidden" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) sendFile(f);
                    e.target.value = '';
                  }} />
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className="px-3 py-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 disabled:opacity-40" title="Send image or file">
                    <Paperclip size={18} />
                  </button>
                  <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send('agent')} placeholder="Type a reply as agent…" className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
                  <button type="button" onClick={() => send('agent')} disabled={!draft.trim() || busy} className="px-4 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-40">
                    <Send size={18} />
                  </button>
                </div>
                <div className="flex gap-2">
                  <button type="button" disabled={!draft.trim() || busy} onClick={() => send('customer')} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40">
                    <UserRound size={12} /> Simulate customer
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm p-6 text-center">
              Select a chat or start a new one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
