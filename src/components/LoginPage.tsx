import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import SpacePlanets from './SpacePlanets';

interface Props {
  audience?: 'customer' | 'agent';
  onOpenPortal?: () => void;
  onOpenAgent?: () => void;
}

function useFallingStars(count: number) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${(i * 41 + 13) % 100}%`,
        size: i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1,
        delay: -((i * 0.37) % 20),
        duration: 8 + (i % 11) * 1.4,
        color: i % 4 === 0 ? '#ff66cc' : i % 3 === 0 ? '#66f0ff' : '#c4b5fd',
        opacity: 0.35 + (i % 6) * 0.1,
      })),
    [count]
  );
}

function NexusLogoMark({ size = 56 }: { size?: number }) {
  return (
    <div className="login-logo-mark" style={{ width: size, height: size }}>
      <svg viewBox="0 0 48 48" width={size} height={size} fill="none" aria-hidden>
        <circle cx="24" cy="24" r="5.5" fill="white" className="login-logo-core" />
        <g className="login-logo-arcs">
          <path d="M24 6a18 18 0 0 1 18 18" stroke="white" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M24 42a18 18 0 0 1-18-18" stroke="white" strokeWidth="3.2" strokeLinecap="round" opacity="0.55" />
        </g>
      </svg>
    </div>
  );
}

const CHAT_LINES = [
  'WOAH COOL', 'NICE TRAIL!', 'Is that Nexus?', 'Sick logo', 'Beep boop', 'Over here!',
  'Support desk?', 'Zoom!', 'Hello agents', 'To the branch!', 'Copy that', 'Need backup?',
  'Tickets flying!', 'SLA green', 'Branch online', 'Portal live', 'Route me in', 'Clear skies',
  'Warp speed', 'Got a ticket?',
];

type Flyby = { id: number; kind: 'ufo' | 'ship'; top: number; duration: number; fromLeft: boolean; chat: string | null };

function UfoIcon() {
  return (
    <svg width="56" height="28" viewBox="0 0 56 28" fill="none">
      <ellipse cx="28" cy="18" rx="24" ry="7" fill="#94a3b8" opacity="0.9" />
      <ellipse cx="28" cy="16" rx="18" ry="5" fill="#cbd5e1" />
      <ellipse cx="28" cy="12" rx="10" ry="8" fill="#a5b4fc" />
      <ellipse cx="28" cy="10" rx="7" ry="5" fill="#c7d2fe" opacity="0.7" />
      <circle cx="20" cy="18" r="1.5" fill="#f0abfc" />
      <circle cx="28" cy="19" r="1.5" fill="#67e8f9" />
      <circle cx="36" cy="18" r="1.5" fill="#fde68a" />
    </svg>
  );
}

function ShipIcon() {
  return (
    <svg width="72" height="28" viewBox="0 0 72 28" fill="none" aria-hidden>
      <ellipse cx="10" cy="14" rx="10" ry="5" fill="url(#rocketFlame)" opacity="0.9" />
      <path d="M14 10 L14 18 L8 20 L4 14 L8 8 Z" fill="#c4b5fd" opacity="0.85" />
      <path d="M16 9 L52 6 L66 14 L52 22 L16 19 Z" fill="#e2e8f0" />
      <path d="M52 6 L66 14 L52 22 Z" fill="#a5b4fc" />
      <rect x="28" y="11" width="12" height="6" rx="1.5" fill="#67e8f9" opacity="0.9" />
      <circle cx="58" cy="14" r="2.2" fill="#fde68a" />
      <path d="M22 9 L18 4 L24 9 Z" fill="#94a3b8" />
      <path d="M22 19 L18 24 L24 19 Z" fill="#94a3b8" />
      <defs>
        <radialGradient id="rocketFlame" cx="80%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="45%" stopColor="#f97316" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function SpaceFlybys() {
  const [flybys, setFlybys] = useState<Flyby[]>([]);
  const idRef = useRef(0);
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const wait = (20 + Math.random() * 30) * 1000;
      timer = setTimeout(() => {
        if (cancelled) return;
        const id = ++idRef.current;
        const kind: 'ufo' | 'ship' = Math.random() < 0.35 ? 'ufo' : 'ship';
        const duration = 6 + Math.random() * 5;
        const fromLeft = Math.random() < 0.5;
        const top = 12 + Math.random() * 55;
        const chat = Math.random() < 0.65 ? CHAT_LINES[Math.floor(Math.random() * CHAT_LINES.length)] : null;
        setFlybys((prev) => [...prev, { id, kind, top, duration, fromLeft, chat }]);
        setTimeout(() => setFlybys((prev) => prev.filter((f) => f.id !== id)), duration * 1000 + 200);
        schedule();
      }, wait);
    };
    timer = setTimeout(() => {
      if (cancelled) return;
      const id = ++idRef.current;
      setFlybys([{ id, kind: 'ship', top: 20 + Math.random() * 40, duration: 7, fromLeft: true, chat: 'WOAH COOL' }]);
      setTimeout(() => setFlybys((p) => p.filter((f) => f.id !== id)), 7200);
      schedule();
    }, 8000);
    return () => { cancelled = true; clearTimeout(timer); };
  }, []);
  return (
    <div className="login-flybys absolute inset-0 pointer-events-none z-[7] overflow-hidden hidden lg:block">
      {flybys.map((f) => (
        <div key={f.id} className={`login-flyby ${f.fromLeft ? 'login-flyby-ltr' : 'login-flyby-rtl'}`} style={{ top: `${f.top}%`, animationDuration: `${f.duration}s` }}>
          {f.chat && <div className="login-flyby-chat">{f.chat}</div>}
          <div className="login-flyby-craft">{f.kind === 'ufo' ? <UfoIcon /> : <ShipIcon />}</div>
        </div>
      ))}
    </div>
  );
}

function ShootingStars() {
  const layerRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    let spawnTimer: ReturnType<typeof setTimeout>;
    let running = false;
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const flyOnce = () => {
      if (cancelled || running) return;
      const layer = layerRef.current;
      const el = starRef.current;
      if (!layer || !el) return;
      const w = layer.clientWidth || window.innerWidth;
      const h = layer.clientHeight || window.innerHeight;
      if (w < 20 || h < 20) return;
      running = true;
      const startX = -40;
      const startY = h * (0.08 + Math.random() * 0.18);
      const endX = w + 40;
      const endY = startY + h * (0.08 + Math.random() * 0.12);
      const ctrlX = w * (0.42 + Math.random() * 0.16);
      const ctrlY = startY - h * (0.06 + Math.random() * 0.08);
      const duration = 4800 + Math.random() * 1600;
      const t0 = performance.now();
      setVisible(true);
      const tick = (now: number) => {
        if (cancelled) return;
        const raw = Math.min(1, (now - t0) / duration);
        const t = ease(raw);
        const inv = 1 - t;
        const x = inv * inv * startX + 2 * inv * t * ctrlX + t * t * endX;
        const y = inv * inv * startY + 2 * inv * t * ctrlY + t * t * endY;
        const dx = 2 * inv * (ctrlX - startX) + 2 * t * (endX - ctrlX);
        const dy = 2 * inv * (ctrlY - startY) + 2 * t * (endY - ctrlY);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        let opacity = 1;
        if (raw < 0.08) opacity = raw / 0.08;
        else if (raw > 0.88) opacity = (1 - raw) / 0.12;
        el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle}deg)`;
        el.style.opacity = String(Math.max(0, Math.min(1, opacity)));
        if (raw < 1) raf = requestAnimationFrame(tick);
        else {
          el.style.opacity = '0';
          setVisible(false);
          running = false;
          if (!cancelled) spawnTimer = setTimeout(flyOnce, 26000 + Math.random() * 14000);
        }
      };
      el.style.opacity = '0';
      el.style.transform = `translate3d(${startX}px, ${startY}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    spawnTimer = setTimeout(flyOnce, 7000 + Math.random() * 3000);
    return () => { cancelled = true; cancelAnimationFrame(raf); clearTimeout(spawnTimer); };
  }, []);
  return (
    <div ref={layerRef} className="login-shooting-layer absolute inset-0 pointer-events-none z-[3] overflow-hidden" aria-hidden>
      <div ref={starRef} className="login-shooting-star" style={{ opacity: visible ? undefined : 0, visibility: visible ? 'visible' : 'hidden' }}>
        <span className="login-star-trail" /><span className="login-star-sparkles" />
        <svg className="login-star-glyph" width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path fill="#ffe9a8" d="M12 1.5 L13.8 9.2 L21.5 9.5 L15.4 14 L17.5 21.5 L12 17.2 L6.5 21.5 L8.6 14 L2.5 9.5 L10.2 9.2 Z" />
        </svg>
      </div>
    </div>
  );
}

type TrailPoint = { x: number; y: number };
const TRAIL_LEN = 32;
function easeInOut(t: number) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function randomIn(min: number, max: number) { return min + Math.random() * (max - min); }

function LogoPilotStage() {
  const pilotRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const history = useRef<TrailPoint[]>([]);
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [stageSize, setStageSize] = useState({ w: 1, h: 1 });
  useEffect(() => {
    let raf = 0;
    let lastSample = 0;
    let x = 0, y = 0, fromX = 0, fromY = 0, toX = 0, toY = 0, toScale = 1, fromScale = 1, scale = 1, startT = 0, duration = 2500, ready = false;
    const pickTarget = (w: number, h: number) => {
      const marginX = w * 0.12, marginY = h * 0.1;
      let nx = randomIn(marginX, w - marginX);
      let ny = randomIn(marginY, h - marginY);
      if (Math.random() < 0.25) ny = randomIn(h * 0.55, h * 0.88);
      if (Math.random() < 0.25) ny = randomIn(h * 0.08, h * 0.28);
      if (Math.random() < 0.2) nx = randomIn(marginX, w * 0.35);
      if (Math.random() < 0.2) nx = randomIn(w * 0.55, w - marginX);
      fromX = x; fromY = y; fromScale = scale; toX = nx; toY = ny; toScale = randomIn(0.88, 1.14);
      startT = performance.now();
      const dist = Math.hypot(toX - fromX, toY - fromY);
      duration = Math.min(4200, Math.max(1400, dist * 2.2 + randomIn(200, 800)));
    };
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const stage = stageRef.current, pilot = pilotRef.current;
      if (!stage || !pilot) return;
      const sr = stage.getBoundingClientRect();
      if (sr.width < 10 || sr.height < 10) return;
      if (!ready) {
        x = sr.width * 0.5; y = sr.height * 0.35; fromX = x; fromY = y; toX = x; toY = y; ready = true;
        pickTarget(sr.width, sr.height);
        setStageSize({ w: sr.width, h: sr.height });
      }
      if (Math.abs(sr.width - stageSize.w) > 8 || Math.abs(sr.height - stageSize.h) > 8) setStageSize({ w: sr.width, h: sr.height });
      const t = Math.min(1, (now - startT) / duration);
      const e = easeInOut(t);
      x = fromX + (toX - fromX) * e; y = fromY + (toY - fromY) * e; scale = fromScale + (toScale - fromScale) * e;
      pilot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`;
      if (t >= 1) pickTarget(sr.width, sr.height);
      if (now - lastSample >= 24) {
        lastSample = now;
        const prev = history.current[0];
        if (!prev || Math.hypot(prev.x - x, prev.y - y) >= 2.5) {
          history.current = [{ x, y }, ...history.current].slice(0, TRAIL_LEN);
          setTrail([...history.current]);
        } else if (history.current.length > 4) {
          history.current = history.current.slice(0, -1);
          setTrail([...history.current]);
        }
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const pathD = useMemo(() => {
    if (trail.length < 2) return '';
    let d = `M ${trail[0].x.toFixed(1)} ${trail[0].y.toFixed(1)}`;
    for (let i = 1; i < trail.length - 1; i++) {
      const midX = (trail[i].x + trail[i + 1].x) / 2;
      const midY = (trail[i].y + trail[i + 1].y) / 2;
      d += ` Q ${trail[i].x.toFixed(1)} ${trail[i].y.toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)}`;
    }
    const last = trail[trail.length - 1];
    d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
    return d;
  }, [trail]);
  return (
    <div ref={stageRef} className="login-pilot-stage absolute inset-0 pointer-events-none z-[5] hidden lg:block" aria-hidden>
      {pathD && (
        <svg className="login-light-trail absolute inset-0 w-full h-full overflow-visible" width={stageSize.w} height={stageSize.h} viewBox={`0 0 ${stageSize.w} ${stageSize.h}`}>
          <defs>
            <linearGradient id="starTrailGrad" gradientUnits="userSpaceOnUse" x1={trail[0]?.x ?? 0} y1={trail[0]?.y ?? 0} x2={trail[trail.length - 1]?.x ?? 0} y2={trail[trail.length - 1]?.y ?? 0}>
              <stop offset="0%" stopColor="#f0abfc" stopOpacity="0.9" />
              <stop offset="25%" stopColor="#e879f9" stopOpacity="0.55" />
              <stop offset="55%" stopColor="#c026d3" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#86198f" stopOpacity="0" />
            </linearGradient>
            <filter id="starGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="starBloom" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="10" /></filter>
          </defs>
          <path d={pathD} fill="none" stroke="url(#starTrailGrad)" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" filter="url(#starBloom)" opacity={0.4} />
          <path d={pathD} fill="none" stroke="url(#starTrailGrad)" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" filter="url(#starGlow)" opacity={0.8} />
        </svg>
      )}
      {trail.slice(2, 12).map((p, i) => {
        const t = i / 10;
        return <span key={`spark-${i}-${Math.round(p.x)}`} className="login-trail-spark" style={{ left: p.x + ((i % 3) - 1) * 5, top: p.y + ((i % 2) * 3 - 1), opacity: Math.max(0, 0.55 * (1 - t)), width: 2 + (1 - t) * 3, height: 2 + (1 - t) * 3 }} />;
      })}
      <div ref={pilotRef} className="login-pilot login-pilot-js" style={{ left: 0, top: 0, transform: 'translate(-50%, -50%)' }}>
        <div className="login-pilot-glow" /><NexusLogoMark size={64} />
      </div>
    </div>
  );
}

function CosmicFallBackground() {
  const stars = useFallingStars(90);
  return (
    <div className="login-cosmos absolute inset-0 overflow-hidden" aria-hidden>
      <div className="login-cosmos-sky absolute inset-0" />
      <div className="login-nebula login-nebula-a absolute inset-0" />
      <div className="login-nebula login-nebula-b absolute inset-0" />
      <SpacePlanets />
      <ShootingStars />
      <div className="login-starfield absolute inset-0">
        {stars.map((s) => (
          <span key={s.id} className="login-star absolute rounded-full" style={{ left: s.left, width: s.size, height: s.size, background: s.color, opacity: s.opacity, boxShadow: `0 0 ${s.size * 3}px ${s.color}`, animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s` }} />
        ))}
      </div>
      <LogoPilotStage />
      <SpaceFlybys />
      <div className="login-cosmos-vignette absolute inset-0 pointer-events-none" />
    </div>
  );
}

const CAPABILITIES = [
  { title: 'Omnichannel inbox', blurb: 'Portal, chat, and email land in one queue.' },
  { title: 'Branch-aware routing', blurb: 'Tickets stay with the right team automatically.' },
  { title: 'SLA + automations', blurb: 'Rules fire on create, priority, and breach.' },
];

export default function LoginPage({ audience = 'customer', onOpenPortal, onOpenAgent }: Props) {
  const { signIn, signUp, configError } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [audienceTab, setAudienceTab] = useState<'agent' | 'customer'>(audience === 'agent' ? 'agent' : 'customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isAgent = audienceTab === 'agent';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      if (mode === 'signin') await signIn(email.trim(), password, isAgent ? 'agent' : 'customer');
      else {
        await signUp(email.trim(), password, name.trim() || undefined, isAgent ? 'agent' : 'customer');
        setInfo('Account created. You can sign in now.');
        setMode('signin');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      if (/pending admin approval|must approve|Account created/i.test(msg)) {
        setInfo(msg);
        setMode('signin');
      } else setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const leftTitle = isAgent ? 'Resolve faster.' : 'Get help, fast.';
  const leftSub = isAgent ? 'Stay organized across every branch.' : 'Submit requests, chat live, and track every ticket.';
  const leftBlurb = isAgent
    ? 'Nexus Ops connects your customer portal, live chat, and agent desk. Route by branch, track SLA, and keep every conversation in one place.'
    : 'Open a request, talk to an agent in real time, or check the status of an existing ticket — all from one place.';
  const caps = isAgent
    ? CAPABILITIES
    : [
        { title: 'Submit & track', blurb: 'Open a request and follow status anytime.' },
        { title: 'Live chat', blurb: 'Reach an agent when you need a quick answer.' },
        { title: 'Branch-aware', blurb: 'Your tickets stay with the right workplace team.' },
      ];
  const cardSub = isAgent ? 'Sign in to Agent Workspace' : 'Sign in to Customer Portal';
  const footerCredit = isAgent
    ? 'NexusOps Agent Workspace · © 2026 Lizer & Kirzhian'
    : 'NexusOps Customer Portal · © 2026 Lizer & Kirzhian';

  return (
    <div className="relative min-h-screen overflow-hidden">
      <CosmicFallBackground />
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-6xl xl:max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 px-5 sm:px-8 lg:px-10 xl:px-12 py-8 lg:py-12 items-center">
          <div className="flex flex-col relative z-10 order-2 lg:order-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 backdrop-blur flex items-center justify-center overflow-hidden">
                <NexusLogoMark size={22} />
              </div>
              <div>
                <div className="text-sm font-semibold text-white tracking-tight">Nexus Ops</div>
                <div className="text-[11px] text-fuchsia-200/70">{isAgent ? 'Support operations platform' : 'Customer support portal'}</div>
              </div>
            </div>
            <div className="mt-8 lg:mt-12 max-w-lg">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-fuchsia-300/80 mb-3">{isAgent ? 'Built for agent teams' : 'Built for customers'}</p>
              <h1 className="text-3xl sm:text-4xl xl:text-[2.75rem] font-semibold text-white leading-tight tracking-tight">
                {leftTitle}<span className="block text-fuchsia-200/90 font-normal mt-1">{leftSub}</span>
              </h1>
              <p className="mt-5 text-sm sm:text-[15px] text-fuchsia-100/75 leading-relaxed max-w-md">{leftBlurb}</p>
              <ul className="mt-8 space-y-3">
                {caps.map((c) => (
                  <li key={c.title} className="flex gap-3 items-start">
                    <span className="login-feature-dot mt-1.5 w-1.5 h-1.5 rounded-full bg-fuchsia-400 shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-white">{c.title}</div>
                      <div className="text-xs text-fuchsia-100/60">{c.blurb}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-10 lg:mt-14 text-[11px] text-fuchsia-200/35 hidden lg:block tracking-wide">{footerCredit}</div>
          </div>

          <div className="flex items-center justify-center lg:justify-end order-1 lg:order-2">
            <div className="login-glass-card w-full max-w-[400px] sm:max-w-[420px] rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col items-center mb-5">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-3">
                  <NexusLogoMark size={28} />
                </div>
                <div className="text-lg font-semibold text-white tracking-tight">Nexus Ops</div>
              </div>
              <div className="flex gap-2 mb-5 p-1 rounded-xl bg-white/5 border border-white/10">
                <button type="button" onClick={() => { setAudienceTab('agent'); setMode('signin'); setError(''); setInfo(''); }}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${isAgent ? 'bg-violet-500/90 text-white shadow-lg shadow-violet-600/30' : 'text-fuchsia-100/70 hover:text-white'}`}>Agent</button>
                <button type="button" onClick={() => { setAudienceTab('customer'); setMode('signin'); setError(''); setInfo(''); }}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${!isAgent ? 'bg-violet-500/90 text-white shadow-lg shadow-violet-600/30' : 'text-fuchsia-100/70 hover:text-white'}`}>Customer</button>
              </div>
              {configError && <div className="mb-4 rounded-lg bg-amber-400/15 text-amber-100 text-sm px-3 py-2 border border-amber-300/30">{configError}</div>}
              {error && <div className="mb-4 rounded-lg bg-rose-500/15 text-rose-100 text-sm px-3 py-2 border border-rose-300/30">{error}</div>}
              {info && <div className="mb-4 rounded-lg bg-emerald-500/15 text-emerald-100 text-sm px-3 py-2 border border-emerald-300/30">{info}</div>}
              <form onSubmit={submit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-fuchsia-100/90 mb-1">Name</label>
                    <input className="login-glass-input w-full rounded-xl px-3 py-2.5 text-sm outline-none" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-fuchsia-100/90 mb-1">Email</label>
                  <input type="email" required className="login-glass-input w-full rounded-xl px-3 py-2.5 text-sm outline-none" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-fuchsia-100/90 mb-1">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} required minLength={6} className="login-glass-input w-full rounded-xl px-3 py-2.5 text-sm outline-none pr-10" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />
                    <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-fuchsia-200/60 hover:text-white px-2" onClick={() => setShowPassword((v) => !v)}>{showPassword ? 'Hide' : 'Show'}</button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="login-submit-btn w-full rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 bg-[length:160%_100%] hover:from-violet-500 hover:via-fuchsia-500 hover:to-violet-500 disabled:opacity-60 text-white font-medium text-sm py-2.5 shadow-lg shadow-violet-600/40">
                  {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
                </button>
                {mode === 'signin' ? (
                  <p className="text-center text-xs text-fuchsia-200/70">
                    New here?{' '}
                    <button type="button" onClick={() => { setMode('signup'); setError(''); setInfo(''); }} className="text-fuchsia-100 hover:text-white font-semibold underline-offset-2 hover:underline">Create an account</button>
                  </p>
                ) : (
                  <p className="text-center text-xs text-fuchsia-200/70">
                    Already registered?{' '}
                    <button type="button" onClick={() => { setMode('signin'); setError(''); setInfo(''); }} className="text-fuchsia-100 hover:text-white font-semibold underline-offset-2 hover:underline">Sign in</button>
                  </p>
                )}
                <p className="text-center text-xs text-fuchsia-200/75">{cardSub}</p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
