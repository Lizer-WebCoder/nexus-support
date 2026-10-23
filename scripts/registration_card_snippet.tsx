{mode === 'signin' ? (
            <div className="login-glass-card w-full max-w-[400px] sm:max-w-[420px] lg:max-w-none rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col items-center mb-5">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-3">
                  <NexusLogoMark size={28} />
                </div>
                <div className="text-lg font-semibold text-white tracking-tight">Nexus Ops</div>
                <p className="mt-1.5 text-xs text-fuchsia-200/80 text-center">{cardSub}</p>
              </div>
              <div className="flex gap-2 mb-5 p-1 rounded-xl bg-white/5 border border-white/10">
                <button type="button" onClick={() => { setAudienceTab('agent'); setError(''); setInfo(''); }}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${isAgent ? 'bg-violet-500/90 text-white shadow-lg shadow-violet-600/30' : 'text-fuchsia-100/70 hover:text-white'}`}>Agent</button>
                <button type="button" onClick={() => { setAudienceTab('customer'); setError(''); setInfo(''); }}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${!isAgent ? 'bg-violet-500/90 text-white shadow-lg shadow-violet-600/30' : 'text-fuchsia-100/70 hover:text-white'}`}>Customer</button>
              </div>
              {configError && <div className="mb-4 rounded-lg bg-amber-400/15 text-amber-100 text-sm px-3 py-2 border border-amber-300/30">{configError}</div>}
              {error && <div className="mb-4 rounded-lg bg-rose-500/15 text-rose-100 text-sm px-3 py-2 border border-rose-300/30">{error}</div>}
              {info && <div className="mb-4 rounded-lg bg-emerald-500/15 text-emerald-100 text-sm px-3 py-2 border border-emerald-300/30">{info}</div>}
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-fuchsia-100/90 mb-1">Email</label>
                  <input type="email" required className="login-glass-input w-full rounded-xl px-3 py-2.5 text-sm outline-none" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-fuchsia-100/90 mb-1">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} required minLength={6} className="login-glass-input w-full rounded-xl px-3 py-2.5 text-sm outline-none pr-12" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
                    <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-fuchsia-100/90 hover:text-white px-2 py-1 rounded-md hover:bg-white/10 transition" onClick={() => setShowPassword((v) => !v)}>{showPassword ? 'Hide' : 'Show'}</button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="login-submit-btn w-full rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 bg-[length:160%_100%] hover:from-violet-500 hover:via-fuchsia-500 hover:to-violet-500 disabled:opacity-60 text-white font-medium text-sm py-2.5 shadow-lg shadow-violet-600/40">
                  {loading ? 'Please wait…' : 'Sign in'}
                </button>
                <div className="space-y-2 pt-1">
                  <p className="text-center text-xs text-fuchsia-200/70">
                    New here?{' '}
                    <button type="button" onClick={() => { setMode('signup'); setError(''); setInfo(''); setPassword(''); setConfirmPassword(''); }} className="text-fuchsia-100 hover:text-white font-semibold underline-offset-2 hover:underline">Create an account</button>
                  </p>
                  {!isAgent && (
                    <p className="text-center text-xs text-fuchsia-200/70">
                      <button type="button" className="text-fuchsia-100/90 hover:text-white font-medium underline-offset-2 hover:underline" onClick={handleForgotPassword}>
                        Forgot Password?
                      </button>
                    </p>
                  )}
                </div>
              </form>
            </div>
            ) : (
            <div className="login-glass-card w-full max-w-[400px] sm:max-w-[440px] lg:max-w-none rounded-2xl p-6 sm:p-8 border border-fuchsia-300/20 shadow-[0_0_40px_rgba(139,92,246,0.15)]">
              <div className="flex flex-col items-center mb-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 border border-white/20 flex items-center justify-center mb-3">
                  <NexusLogoMark size={28} />
                </div>
                <div className="text-lg font-semibold text-white tracking-tight">Create your account</div>
                <p className="mt-1.5 text-xs text-fuchsia-200/80 text-center">
                  {isAgent ? 'Register for Agent Workspace' : 'Register for Customer Portal'}
                </p>
                <span className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium border ${isAgent ? 'bg-violet-500/20 border-violet-400/40 text-violet-100' : 'bg-fuchsia-500/20 border-fuchsia-400/40 text-fuchsia-100'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isAgent ? 'bg-violet-300' : 'bg-fuchsia-300'}`} />
                  {isAgent ? 'Agent registration' : 'Customer registration'}
                </span>
              </div>
              {configError && <div className="mb-4 rounded-lg bg-amber-400/15 text-amber-100 text-sm px-3 py-2 border border-amber-300/30">{configError}</div>}
              {error && <div className="mb-4 rounded-lg bg-rose-500/15 text-rose-100 text-sm px-3 py-2 border border-rose-300/30">{error}</div>}
              {info && <div className="mb-4 rounded-lg bg-emerald-500/15 text-emerald-100 text-sm px-3 py-2 border border-emerald-300/30">{info}</div>}
              <form onSubmit={submit} className="space-y-3.5">
                <div>
                  <label className="block text-sm font-medium text-fuchsia-100/90 mb-1">Full name</label>
                  <input required className="login-glass-input w-full rounded-xl px-3 py-2.5 text-sm outline-none" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" autoComplete="name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-fuchsia-100/90 mb-1">Email</label>
                  <input type="email" required className="login-glass-input w-full rounded-xl px-3 py-2.5 text-sm outline-none" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-fuchsia-100/90 mb-1">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} required minLength={6} className="login-glass-input w-full rounded-xl px-3 py-2.5 text-sm outline-none pr-12" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="new-password" />
                    <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-fuchsia-100/90 hover:text-white px-2 py-1 rounded-md hover:bg-white/10 transition" onClick={() => setShowPassword((v) => !v)}>{showPassword ? 'Hide' : 'Show'}</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-fuchsia-100/90 mb-1">Confirm password</label>
                  <div className="relative">
                    <input type={showConfirm ? 'text' : 'password'} required minLength={6} className="login-glass-input w-full rounded-xl px-3 py-2.5 text-sm outline-none pr-12" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" autoComplete="new-password" />
                    <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-fuchsia-100/90 hover:text-white px-2 py-1 rounded-md hover:bg-white/10 transition" onClick={() => setShowConfirm((v) => !v)}>{showConfirm ? 'Hide' : 'Show'}</button>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => { setAudienceTab('agent'); setError(''); }}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition ${isAgent ? 'bg-violet-500/25 border-violet-400/50 text-white' : 'border-white/10 text-fuchsia-200/60 hover:text-white'}`}>Agent</button>
                  <button type="button" onClick={() => { setAudienceTab('customer'); setError(''); }}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition ${!isAgent ? 'bg-fuchsia-500/25 border-fuchsia-400/50 text-white' : 'border-white/10 text-fuchsia-200/60 hover:text-white'}`}>Customer</button>
                </div>
                <button type="submit" disabled={loading} className="login-submit-btn w-full rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 bg-[length:160%_100%] hover:from-violet-500 hover:via-fuchsia-500 hover:to-violet-500 disabled:opacity-60 text-white font-medium text-sm py-2.5 shadow-lg shadow-violet-600/40 mt-1">
                  {loading ? 'Creating account…' : 'Create account'}
                </button>
                <p className="text-center text-xs text-fuchsia-200/70 pt-1">
                  Already have an account?{' '}
                  <button type="button" onClick={() => { setMode('signin'); setError(''); setInfo(''); setConfirmPassword(''); }} className="text-fuchsia-100 hover:text-white font-semibold underline-offset-2 hover:underline">Sign in</button>
                </p>
              </form>
            </div>
            )}
