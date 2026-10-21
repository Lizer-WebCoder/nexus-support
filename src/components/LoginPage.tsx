import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface Props {
  onOpenPortal?: () => void;
}

/** Stylized platformer sky (original art — not Nintendo assets). */
function PlatformerBackground() {
  return (
    <div className="login-platform absolute inset-0 overflow-hidden" aria-hidden>
      {/* Sky gradient */}
      <div className="login-sky absolute inset-0" />

      {/* Animated clouds */}
      <div className="login-clouds absolute inset-0">
        <span className="login-cloud login-cloud-a" />
        <span className="login-cloud login-cloud-b" />
        <span className="login-cloud login-cloud-c" />
        <span className="login-cloud login-cloud-d" />
        <span className="login-cloud login-cloud-e" />
      </div>

      {/* Far hills */}
      <svg className="login-hills-far absolute bottom-0 left-0 w-[140%] h-[42%]" viewBox="0 0 1400 280" preserveAspectRatio="none">
        <path
          fill="#3d8b3d"
          d="M0 280 V160 C80 120 160 180 240 140 C320 100 400 160 480 130 C560 100 640 150 720 120 C800 90 880 140 960 110 C1040 80 1120 130 1200 100 C1280 70 1340 120 1400 90 V280 Z"
        />
      </svg>

      {/* Near hills */}
      <svg className="login-hills-near absolute bottom-0 left-0 w-[120%] h-[36%]" viewBox="0 0 1200 240" preserveAspectRatio="none">
        <path
          fill="#2d7a2d"
          d="M0 240 V100 C100 60 180 120 260 80 C340 40 420 100 500 70 C580 40 660 90 740 60 C820 30 900 80 980 50 C1060 20 1140 70 1200 40 V240 Z"
        />
        {/* Simple bush blobs */}
        <ellipse cx="180" cy="175" rx="55" ry="40" fill="#3cb043" />
        <ellipse cx="220" cy="165" rx="40" ry="35" fill="#34a03a" />
        <ellipse cx="150" cy="170" rx="35" ry="30" fill="#2e9a36" />
        <ellipse cx="520" cy="185" rx="45" ry="32" fill="#3cb043" />
        <ellipse cx="555" cy="178" rx="32" ry="28" fill="#34a03a" />
      </svg>

      {/* Ground strip */}
      <div className="login-ground absolute bottom-0 left-0 right-0 h-[14%]" />

      {/* Floating question blocks */}
      <div className="login-blocks absolute inset-0 pointer-events-none">
        <span className="login-qblock" style={{ left: '12%', top: '28%' }}>?</span>
        <span className="login-qblock login-qblock-delay" style={{ left: '78%', top: '22%' }}>?</span>
        <span className="login-qblock" style={{ left: '62%', top: '38%' }}>?</span>
      </div>

      {/* Pipes */}
      <div className="login-pipe login-pipe-sm" style={{ left: '8%' }}>
        <div className="login-pipe-lip" />
        <div className="login-pipe-body" />
      </div>
      <div className="login-pipe login-pipe-lg" style={{ right: '14%', left: 'auto' }}>
        <div className="login-pipe-lip" />
        <div className="login-pipe-body" />
      </div>

      {/* Soft vignette so the card stays readable */}
      <div className="login-platform-vignette absolute inset-0 pointer-events-none" />
    </div>
  );
}

export default function LoginPage({ onOpenPortal }: Props) {
  const { signIn, signUp, configError } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password, name.trim() || undefined);
        setInfo(
          'Account created. If email confirmation is enabled in Supabase, check your inbox before signing in.'
        );
        setMode('signin');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <PlatformerBackground />

      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center mx-auto shadow-lg shadow-black/20 ring-2 ring-white/40">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="12" cy="12" r="3" fill="white" />
                <path d="M12 3a9 9 0 0 1 9 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                <path
                  d="M12 21a9 9 0 0 1-9-9"
                  stroke="white"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  opacity="0.55"
                />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]">
              Nexus Ops
            </h1>
            <p className="text-sm text-white/90 mt-1 drop-shadow-sm">Agent support desk</p>
          </div>

          {configError && (
            <div className="mb-4 text-sm text-amber-900 bg-amber-100/95 border border-amber-300 px-3 py-3 rounded-xl shadow-sm">
              <p className="font-medium mb-1">Supabase configuration problem</p>
              <p>{configError}</p>
            </div>
          )}

          <div className="login-card-glow bg-white rounded-2xl border border-zinc-200/80 p-6">
            <div className="flex rounded-lg bg-zinc-100 p-1 mb-5">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError('');
                  setInfo('');
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  mode === 'signin' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError('');
                  setInfo('');
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  mode === 'signup' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'
                }`}
              >
                Create account
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {error && (
                <div className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg whitespace-pre-wrap">
                  {error}
                </div>
              )}
              {info && (
                <div className="text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">{info}</div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Full name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
                    placeholder="Sarah Chen"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Work email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create agent account'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-white/85 mt-6 drop-shadow-sm">
            Customers use the{' '}
            <button
              type="button"
              onClick={onOpenPortal}
              className="text-white font-semibold underline underline-offset-2 hover:text-amber-100"
            >
              customer portal
            </button>
            {' '}(account + admin approval required).
          </p>
        </div>
      </div>
    </div>
  );
}
