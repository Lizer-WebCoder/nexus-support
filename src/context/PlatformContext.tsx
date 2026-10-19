import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type {
  KnowledgeArticle,
  ChatConversation,
  ChatMessage,
  AppNotification,
  Automation,
  CannedResponse,
  SurveyResponse,
  QualityReview,
  Announcement,
  FormDef,
  Release,
} from '../types';

const LS = {
  kb: 'nexus-kb-v1',
  chat: 'nexus-chat-v1',
  notif: 'nexus-notif-v1',
  auto: 'nexus-auto-v1',
  canned: 'nexus-canned-v1',
  survey: 'nexus-survey-v1',
  quality: 'nexus-quality-v1',
  announce: 'nexus-announce-v1',
  forms: 'nexus-forms-v1',
  releases: 'nexus-releases-v1',
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {}
  return fallback;
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

const DEFAULT_KB: KnowledgeArticle[] = [
  { id: 'kb-1', title: 'How to reset a customer password', category: 'Account', body: '1. Open the customer profile.\n2. Click Security → Reset password.\n3. Link expires in 24 hours.', published: true },
  { id: 'kb-2', title: 'SSO / Okta troubleshooting', category: 'Auth', body: 'Check clock skew, ACS URL, and app assignment in Okta.', published: true },
  { id: 'kb-3', title: 'API rate limits', category: 'API', body: 'Free 60/min · Pro 600/min. 429 includes Retry-After.', published: true },
  { id: 'kb-4', title: 'SLA policies', category: 'Support', body: 'Critical 15m/4h · High 1h/8h · Medium 4h/24h · Low 8h/72h', published: true },
];

const DEFAULT_CANNED: CannedResponse[] = [
  { id: 'cr-1', title: 'Greeting', body: "Hi! Thanks for contacting support. I'm looking into this now.", shortcut: '/hi' },
  { id: 'cr-2', title: 'Need more info', body: 'Could you share screenshots, the exact error, and when this started?', shortcut: '/info' },
  { id: 'cr-3', title: 'Resolved', body: 'This should now be fixed. Please reply if anything still looks wrong.', shortcut: '/done' },
];

const DEFAULT_AUTO: Automation[] = [
  { id: 'a1', name: 'Critical keyword boost', enabled: true, trigger: 'ticket_created', condition_field: 'title', condition_op: 'contains', condition_value: 'down', action: 'set_priority', action_value: 'critical' },
  { id: 'a2', name: 'Billing priority', enabled: true, trigger: 'ticket_created', condition_field: 'title', condition_op: 'contains', condition_value: 'billing', action: 'set_priority', action_value: 'high' },
];

const DEFAULT_FORMS: FormDef[] = [
  { id: 'f1', name: 'General support', description: 'Default intake', fields: [{ id: 'subject', label: 'Subject', type: 'text', required: true }, { id: 'details', label: 'Details', type: 'textarea', required: true }], active: true },
  { id: 'f2', name: 'Billing request', description: 'Invoice issues', fields: [{ id: 'invoice', label: 'Invoice #', type: 'text', required: true }, { id: 'details', label: 'Details', type: 'textarea', required: true }], active: true },
];

const DEFAULT_RELEASES: Release[] = [
  { id: 'r1', version: '1.2.0', title: 'Full platform modules', notes: 'Profile, notifications, KB, chat, automations, QA, surveys.', released_at: new Date().toISOString() },
  { id: 'r2', version: '1.1.0', title: 'Cloud tickets & auth', notes: 'Supabase agent accounts and customer portal.', released_at: new Date(Date.now() - 86400000 * 7).toISOString() },
];

const DEFAULT_ANNOUNCE: Announcement[] = [
  { id: 'an1', title: 'Welcome to Nexus Support', body: 'Command center is live. Share #/portal with customers.', severity: 'info', active: true, created_at: new Date().toISOString() },
];

interface PlatformContextValue {
  articles: KnowledgeArticle[];
  conversations: ChatConversation[];
  notifications: AppNotification[];
  automations: Automation[];
  canned: CannedResponse[];
  surveys: SurveyResponse[];
  reviews: QualityReview[];
  announcements: Announcement[];
  forms: FormDef[];
  releases: Release[];
  unreadCount: number;
  refreshPlatform: () => Promise<void>;
  // KB
  saveArticle: (a: Partial<KnowledgeArticle> & { title: string; body: string }) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  // Chat
  sendChatMessage: (conversationId: string, text: string, sender?: 'agent' | 'customer') => Promise<void>;
  setChatStatus: (id: string, status: ChatConversation['status']) => Promise<void>;
  createChat: (customer_name: string, customer_email?: string) => Promise<ChatConversation>;
  // Notifications
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  pushNotification: (title: string, body: string, link?: string) => Promise<void>;
  // Automations
  saveAutomation: (a: Partial<Automation> & { name: string }) => Promise<void>;
  deleteAutomation: (id: string) => Promise<void>;
  runAutomationsOnTicket: (ticket: { title: string; priority: string }) => { priority?: string };
  // Canned
  saveCanned: (c: Partial<CannedResponse> & { title: string; body: string }) => Promise<void>;
  deleteCanned: (id: string) => Promise<void>;
  // Surveys / QA
  addSurvey: (s: Omit<SurveyResponse, 'id' | 'created_at'>) => Promise<void>;
  addReview: (r: Omit<QualityReview, 'id' | 'created_at'>) => Promise<void>;
  // Announcements / forms / releases
  saveAnnouncement: (a: Partial<Announcement> & { title: string; body: string }) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  saveForm: (f: Partial<FormDef> & { name: string }) => Promise<void>;
  deleteForm: (id: string) => Promise<void>;
  saveRelease: (r: Partial<Release> & { version: string; title: string }) => Promise<void>;
  deleteRelease: (id: string) => Promise<void>;
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

export function PlatformProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [articles, setArticles] = useState<KnowledgeArticle[]>(() => load(LS.kb, DEFAULT_KB));
  const [conversations, setConversations] = useState<ChatConversation[]>(() => load(LS.chat, []));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => load(LS.notif, []));
  const [automations, setAutomations] = useState<Automation[]>(() => load(LS.auto, DEFAULT_AUTO));
  const [canned, setCanned] = useState<CannedResponse[]>(() => load(LS.canned, DEFAULT_CANNED));
  const [surveys, setSurveys] = useState<SurveyResponse[]>(() => load(LS.survey, []));
  const [reviews, setReviews] = useState<QualityReview[]>(() => load(LS.quality, []));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => load(LS.announce, DEFAULT_ANNOUNCE));
  const [forms, setForms] = useState<FormDef[]>(() => load(LS.forms, DEFAULT_FORMS));
  const [releases, setReleases] = useState<Release[]>(() => load(LS.releases, DEFAULT_RELEASES));

  const refreshPlatform = useCallback(async () => {
    if (!supabase) return;
    const [
      kb, chats, msgs, notifs, autos, cans, surv, qa, ann, frm, rel,
    ] = await Promise.all([
      supabase.from('knowledge_articles').select('*').order('created_at', { ascending: false }),
      supabase.from('chat_conversations').select('*').order('updated_at', { ascending: false }),
      supabase.from('chat_messages').select('*').order('created_at', { ascending: true }),
      supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('automations').select('*'),
      supabase.from('canned_responses').select('*'),
      supabase.from('survey_responses').select('*').order('created_at', { ascending: false }),
      supabase.from('quality_reviews').select('*').order('created_at', { ascending: false }),
      supabase.from('announcements').select('*').order('created_at', { ascending: false }),
      supabase.from('forms').select('*'),
      supabase.from('releases').select('*').order('released_at', { ascending: false }),
    ]);

    if (kb.data?.length) setArticles(kb.data as KnowledgeArticle[]);
    if (autos.data?.length) setAutomations(autos.data as Automation[]);
    if (cans.data?.length) setCanned(cans.data as CannedResponse[]);
    if (surv.data) setSurveys(surv.data as SurveyResponse[]);
    if (qa.data) setReviews(qa.data as QualityReview[]);
    if (ann.data?.length) setAnnouncements(ann.data as Announcement[]);
    if (frm.data?.length) setForms(frm.data as FormDef[]);
    if (rel.data?.length) setReleases(rel.data as Release[]);
    if (notifs.data) setNotifications(notifs.data as AppNotification[]);

    if (chats.data) {
      const messageMap = new Map<string, ChatMessage[]>();
      (msgs.data || []).forEach((m: ChatMessage & { conversation_id: string }) => {
        const list = messageMap.get(m.conversation_id) || [];
        list.push({
          id: m.id,
          sender: m.sender,
          text: m.text,
          created_at: m.created_at,
          conversation_id: m.conversation_id,
        });
        messageMap.set(m.conversation_id, list);
      });
      setConversations(
        (chats.data as ChatConversation[]).map((c) => ({
          ...c,
          messages: messageMap.get(c.id) || [],
        }))
      );
    }
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured) refreshPlatform();
  }, [refreshPlatform]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      save(LS.kb, articles);
      save(LS.chat, conversations);
      save(LS.notif, notifications);
      save(LS.auto, automations);
      save(LS.canned, canned);
      save(LS.survey, surveys);
      save(LS.quality, reviews);
      save(LS.announce, announcements);
      save(LS.forms, forms);
      save(LS.releases, releases);
    }
  }, [articles, conversations, notifications, automations, canned, surveys, reviews, announcements, forms, releases]);

  const saveArticle = async (a: Partial<KnowledgeArticle> & { title: string; body: string }) => {
    if (supabase) {
      if (a.id) {
        await supabase.from('knowledge_articles').update({ title: a.title, body: a.body, category: a.category || 'General', published: a.published ?? true, updated_at: new Date().toISOString() }).eq('id', a.id);
      } else {
        await supabase.from('knowledge_articles').insert({ title: a.title, body: a.body, category: a.category || 'General', published: true });
      }
      await refreshPlatform();
    } else {
      setArticles((prev) => {
        if (a.id) return prev.map((x) => (x.id === a.id ? { ...x, ...a } as KnowledgeArticle : x));
        return [{ id: `kb-${Date.now()}`, title: a.title, body: a.body, category: a.category || 'General', published: true }, ...prev];
      });
    }
  };

  const deleteArticle = async (id: string) => {
    if (supabase) {
      await supabase.from('knowledge_articles').delete().eq('id', id);
      await refreshPlatform();
    } else setArticles((p) => p.filter((x) => x.id !== id));
  };

  const createChat = async (customer_name: string, customer_email?: string) => {
    const row: ChatConversation = {
      id: `c-${Date.now()}`,
      customer_name,
      customer_email,
      status: 'waiting',
      preview: '',
      unread: 0,
      messages: [],
      created_at: new Date().toISOString(),
    };
    if (supabase) {
      const { data } = await supabase.from('chat_conversations').insert({
        customer_name, customer_email, status: 'waiting', preview: '', unread: 0,
      }).select('*').single();
      if (data) {
        await refreshPlatform();
        return { ...(data as ChatConversation), messages: [] };
      }
    }
    setConversations((p) => [row, ...p]);
    return row;
  };

  const sendChatMessage = async (conversationId: string, text: string, sender: 'agent' | 'customer' = 'agent') => {
    const msg: ChatMessage = {
      id: `m-${Date.now()}`,
      conversation_id: conversationId,
      sender,
      text: text.trim(),
      created_at: new Date().toISOString(),
    };
    if (supabase) {
      await supabase.from('chat_messages').insert({
        conversation_id: conversationId,
        sender,
        text: msg.text,
      });
      await supabase.from('chat_conversations').update({
        preview: msg.text,
        status: 'active',
        unread: sender === 'customer' ? 1 : 0,
        updated_at: new Date().toISOString(),
      }).eq('id', conversationId);
      await refreshPlatform();
    } else {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                messages: [...(c.messages || []), msg],
                preview: msg.text,
                status: 'active',
                unread: sender === 'customer' ? (c.unread || 0) + 1 : 0,
              }
            : c
        )
      );
    }
  };

  const setChatStatus = async (id: string, status: ChatConversation['status']) => {
    if (supabase) {
      await supabase.from('chat_conversations').update({ status }).eq('id', id);
      await refreshPlatform();
    } else {
      setConversations((p) => p.map((c) => (c.id === id ? { ...c, status } : c)));
    }
  };

  const pushNotification = async (title: string, body: string, link?: string) => {
    const n: AppNotification = {
      id: `n-${Date.now()}`,
      user_id: user?.id,
      title,
      body,
      link,
      read: false,
      created_at: new Date().toISOString(),
    };
    if (supabase && user) {
      await supabase.from('notifications').insert({
        user_id: user.id, title, body, link, read: false,
      });
      await refreshPlatform();
    } else {
      setNotifications((p) => [n, ...p].slice(0, 50));
    }
  };

  const markNotificationRead = async (id: string) => {
    if (supabase) {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
      await refreshPlatform();
    } else setNotifications((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = async () => {
    if (supabase && user) {
      await supabase.from('notifications').update({ read: true }).eq('user_id', user.id);
      await refreshPlatform();
    } else setNotifications((p) => p.map((n) => ({ ...n, read: true })));
  };

  const saveAutomation = async (a: Partial<Automation> & { name: string }) => {
    if (supabase) {
      if (a.id) await supabase.from('automations').update(a).eq('id', a.id);
      else await supabase.from('automations').insert({
        name: a.name,
        enabled: a.enabled ?? true,
        trigger: a.trigger || 'ticket_created',
        condition_field: a.condition_field,
        condition_op: a.condition_op || 'contains',
        condition_value: a.condition_value,
        action: a.action || 'set_priority',
        action_value: a.action_value,
      });
      await refreshPlatform();
    } else {
      setAutomations((prev) => {
        if (a.id) return prev.map((x) => (x.id === a.id ? { ...x, ...a } as Automation : x));
        return [{ id: `auto-${Date.now()}`, enabled: true, trigger: 'ticket_created', action: 'set_priority', ...a } as Automation, ...prev];
      });
    }
  };

  const deleteAutomation = async (id: string) => {
    if (supabase) {
      await supabase.from('automations').delete().eq('id', id);
      await refreshPlatform();
    } else setAutomations((p) => p.filter((x) => x.id !== id));
  };

  const runAutomationsOnTicket = (ticket: { title: string; priority: string }) => {
    const result: { priority?: string } = {};
    automations.filter((a) => a.enabled).forEach((a) => {
      const field = (ticket as Record<string, string>)[a.condition_field || 'title'] || '';
      const val = (a.condition_value || '').toLowerCase();
      const match =
        a.condition_op === 'contains'
          ? field.toLowerCase().includes(val)
          : field.toLowerCase() === val;
      if (match && a.action === 'set_priority' && a.action_value) {
        result.priority = a.action_value;
      }
    });
    return result;
  };

  const saveCanned = async (c: Partial<CannedResponse> & { title: string; body: string }) => {
    if (supabase) {
      if (c.id) await supabase.from('canned_responses').update(c).eq('id', c.id);
      else await supabase.from('canned_responses').insert({ title: c.title, body: c.body, shortcut: c.shortcut });
      await refreshPlatform();
    } else {
      setCanned((prev) => {
        if (c.id) return prev.map((x) => (x.id === c.id ? { ...x, ...c } as CannedResponse : x));
        return [{ id: `cr-${Date.now()}`, ...c } as CannedResponse, ...prev];
      });
    }
  };

  const deleteCanned = async (id: string) => {
    if (supabase) {
      await supabase.from('canned_responses').delete().eq('id', id);
      await refreshPlatform();
    } else setCanned((p) => p.filter((x) => x.id !== id));
  };

  const addSurvey = async (s: Omit<SurveyResponse, 'id' | 'created_at'>) => {
    const row = { ...s, id: `s-${Date.now()}`, created_at: new Date().toISOString() };
    if (supabase) {
      await supabase.from('survey_responses').insert(s);
      await refreshPlatform();
    } else setSurveys((p) => [row, ...p]);
  };

  const addReview = async (r: Omit<QualityReview, 'id' | 'created_at'>) => {
    const row = { ...r, id: `q-${Date.now()}`, created_at: new Date().toISOString() };
    if (supabase) {
      await supabase.from('quality_reviews').insert(r);
      await refreshPlatform();
    } else setReviews((p) => [row, ...p]);
  };

  const saveAnnouncement = async (a: Partial<Announcement> & { title: string; body: string }) => {
    if (supabase) {
      if (a.id) await supabase.from('announcements').update(a).eq('id', a.id);
      else await supabase.from('announcements').insert({ title: a.title, body: a.body, severity: a.severity || 'info', active: a.active ?? true });
      await refreshPlatform();
    } else {
      setAnnouncements((prev) => {
        if (a.id) return prev.map((x) => (x.id === a.id ? { ...x, ...a } as Announcement : x));
        return [{ id: `an-${Date.now()}`, severity: 'info', active: true, created_at: new Date().toISOString(), ...a } as Announcement, ...prev];
      });
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (supabase) {
      await supabase.from('announcements').delete().eq('id', id);
      await refreshPlatform();
    } else setAnnouncements((p) => p.filter((x) => x.id !== id));
  };

  const saveForm = async (f: Partial<FormDef> & { name: string }) => {
    if (supabase) {
      if (f.id) await supabase.from('forms').update(f).eq('id', f.id);
      else await supabase.from('forms').insert({ name: f.name, description: f.description, fields: f.fields || [], active: true });
      await refreshPlatform();
    } else {
      setForms((prev) => {
        if (f.id) return prev.map((x) => (x.id === f.id ? { ...x, ...f } as FormDef : x));
        return [{ id: `f-${Date.now()}`, fields: [], active: true, ...f } as FormDef, ...prev];
      });
    }
  };

  const deleteForm = async (id: string) => {
    if (supabase) {
      await supabase.from('forms').delete().eq('id', id);
      await refreshPlatform();
    } else setForms((p) => p.filter((x) => x.id !== id));
  };

  const saveRelease = async (r: Partial<Release> & { version: string; title: string }) => {
    if (supabase) {
      if (r.id) await supabase.from('releases').update(r).eq('id', r.id);
      else await supabase.from('releases').insert({ version: r.version, title: r.title, notes: r.notes || '' });
      await refreshPlatform();
    } else {
      setReleases((prev) => {
        if (r.id) return prev.map((x) => (x.id === r.id ? { ...x, ...r } as Release : x));
        return [{ id: `r-${Date.now()}`, notes: '', released_at: new Date().toISOString(), ...r } as Release, ...prev];
      });
    }
  };

  const deleteRelease = async (id: string) => {
    if (supabase) {
      await supabase.from('releases').delete().eq('id', id);
      await refreshPlatform();
    } else setReleases((p) => p.filter((x) => x.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <PlatformContext.Provider
      value={{
        articles, conversations, notifications, automations, canned, surveys, reviews, announcements, forms, releases,
        unreadCount, refreshPlatform,
        saveArticle, deleteArticle,
        sendChatMessage, setChatStatus, createChat,
        markNotificationRead, markAllNotificationsRead, pushNotification,
        saveAutomation, deleteAutomation, runAutomationsOnTicket,
        saveCanned, deleteCanned,
        addSurvey, addReview,
        saveAnnouncement, deleteAnnouncement,
        saveForm, deleteForm,
        saveRelease, deleteRelease,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error('usePlatform must be used within PlatformProvider');
  return ctx;
}
