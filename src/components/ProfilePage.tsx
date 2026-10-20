import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTickets } from '../context/TicketContext';
import { supabase } from '../lib/supabase';
import type { AgentStatus } from '../types';

export default function ProfilePage() {
  const { user } = useAuth();
  const { currentAgent, updateAgentStatus, refresh } = useTickets();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [status, setStatus] = useState<AgentStatus>('online');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentAgent) {
      setName(currentAgent.name);
      setPhone(currentAgent.phone || '');
      setBio(currentAgent.bio || '');
      setTimezone(currentAgent.timezone || 'UTC');
      setStatus(currentAgent.status);
    } else if (user) {
      setName((user.user_metadata?.full_name as string) || user.email?.split('@')[0] || '');
    }
  }, [currentAgent, user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    setSaving(true);
    try {
      if (supabase && user) {
        await supabase.auth.updateUser({ data: { full_name: name.trim() } });
        if (currentAgent) {
          const parts = name.trim().split(/\s+/);
          const initials = parts.map((p) => p[0]).join('').slice(0, 2).toUpperCase();
          await supabase.from('agents').update({
            name: name.trim(),
            initials,
            phone: phone.trim() || null,
            bio: bio.trim() || null,
            timezone,
            status,
          }).eq('id', currentAgent.id);
        }
        await refresh();
      } else if (currentAgent) {
        await updateAgentStatus(status);
      }
      if (status !== currentAgent?.status) await updateAgentStatus(status);
      setMsg('Profile saved.');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    if (password.length < 6) {
      setErr('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      if (!supabase) throw new Error('Cloud auth required to change password');
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPassword('');
      setMsg('Password updated.');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Could not update password');
    } finally {
      setSaving(false);
    }
  };

  const avatar = (name || 'A')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-card p-8">
        <div className="flex items-center gap-5 mb-8 pb-6 border-b border-zinc-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-brand-500/20">
            {avatar}
          </div>
          <div className="min-w-0">
            <div className="text-xl font-semibold text-zinc-900 tracking-tight truncate">{name || 'Agent'}</div>
            <div className="text-sm text-zinc-500 mt-0.5 truncate">{user?.email}</div>
            {currentAgent && (
              <div className="text-xs text-zinc-400 mt-1.5">
                {currentAgent.role} · <span className="text-brand-600 font-medium capitalize">{currentAgent.status}</span>
              </div>
            )}
          </div>
        </div>

        {msg && (
          <div className="mb-5 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-3 rounded-xl">{msg}</div>
        )}
        {err && (
          <div className="mb-5 text-sm text-rose-600 bg-rose-50 border border-rose-100 px-4 py-3 rounded-xl">{err}</div>
        )}

        <form onSubmit={saveProfile} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Display name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
                placeholder="+1 555 000 0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AgentStatus)}
                className="w-full px-4 py-2.5 text-sm border border-zinc-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
              >
                <option value="online">Online</option>
                <option value="busy">Busy</option>
                <option value="away">Away</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-zinc-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
            >
              {['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo', 'Asia/Seoul', 'Asia/Manila'].map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 resize-y"
              placeholder="Short intro for your team"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-card p-8">
        <h2 className="text-base font-semibold text-zinc-900 mb-1">Change password</h2>
        <p className="text-sm text-zinc-500 mb-5">Use a strong password you don’t reuse elsewhere.</p>
        <form onSubmit={changePassword} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            placeholder="New password (min 6 characters)"
            className="w-full px-4 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
          />
          <button
            type="submit"
            disabled={saving || !password}
            className="px-5 py-2.5 text-sm font-medium text-brand-700 bg-brand-50 border border-brand-100 rounded-xl hover:bg-brand-100 disabled:opacity-50 transition-colors"
          >
            Update password
          </button>
        </form>
      </div>
    </div>
  );
}
