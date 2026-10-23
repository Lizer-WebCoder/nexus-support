import { useCallback, useEffect, useRef, useState } from 'react';
import { Send, Users, ArrowLeft } from 'lucide-react';

const LS_KEY = 'nexus-community-chat-v1';

export type CommunityMessage = {
  id: string;
  author_name: string;
  author_email: string;
  text: string;
  created_at: string;
};

function loadMessages(): CommunityMessage[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as CommunityMessage[];
  } catch {}
  return [];
}

function saveMessages(list: CommunityMessage[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list.slice(-200)));
  } catch {}
}

interface Props {
  displayName: string;
  email: string;
  onBack?: () => void;
}

export default function PortalCommunityChat({ displayName, email, onBack }: Props) {
  const [messages, setMessages] = useState<CommunityMessage[]>(() => loadMessages());
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(() => {
    setMessages(loadMessages());
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_KEY) refresh();
    };
    window.addEventListener('storage', onStorage);
    const t = setInterval(refresh, 2500);
    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(t);
    };
  }, [refresh]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const send = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const msg: CommunityMessage = {
      id: `cm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      author_name: displayName || 'Customer',
      author_email: email || '',
      text,
      created_at: new Date().toISOString(),
    };
    const next = [...loadMessages(), msg];
    saveMessages(next);
    setMessages(next);
    setDraft('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[720px] bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100 bg-zinc-50/80">
        {onBack && (
          <button type="button" onClick={onBack} className="md:hidden p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100">
            <ArrowLeft size={18} />
          </button>
        )}
        <div className="w-9 h-9 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
          <Users size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-zinc-900">Community</div>
          <div className="text-[11px] text-zinc-500">Chat with other customers — no ticket required</div>
        </div>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-zinc-50/40">
        {messages.length === 0 && (
          <div className="text-center py-12 px-4">
            <Users className="mx-auto text-zinc-300 mb-3" size={32} />
            <p className="text-sm font-medium text-zinc-600">No messages yet</p>
            <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
              Ask the community about workarounds, shared issues, or tips before opening a support ticket.
            </p>
          </div>
        )}
        {messages.map((m) => {
          const mine = m.author_email && email && m.author_email.toLowerCase() === email.toLowerCase();
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                  mine
                    ? 'bg-brand-600 text-white rounded-br-md'
                    : 'bg-white border border-zinc-200 text-zinc-800 rounded-bl-md shadow-sm'
                }`}
              >
                {!mine && (
                  <div className={`text-[11px] font-semibold mb-0.5 ${mine ? 'text-white/80' : 'text-violet-600'}`}>
                    {m.author_name}
                  </div>
                )}
                <div className="whitespace-pre-wrap break-words">{m.text}</div>
                <div className={`text-[10px] mt-1 ${mine ? 'text-white/60' : 'text-zinc-400'}`}>
                  {new Date(m.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="p-3 border-t border-zinc-100 bg-white flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Share a question or tip with other customers…"
          className="flex-1 px-3.5 py-2.5 text-sm rounded-lg border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-400 focus:bg-white"
          maxLength={2000}
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="px-3.5 py-2.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 shrink-0"
          aria-label="Send"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
