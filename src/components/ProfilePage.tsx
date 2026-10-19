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
          const initials = name
            .trim()
            .split(/\s+/)
            .map((p) => p[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
          await supabase
            .from('agents')
            .update({
              name: name.trim(),
              initials,
              phone: phone.trim() || null,
              bio: bio.trim() || null,
              timezone,
              status,
            })
            .eq('id', currentAgent.id);
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
      setErr('Password must be at least 6 characters');\n      return;
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

  return (
    <div className="max-w-xl space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center text-white text-lg font-bold">
            {(name || 'A')
              .split(' ')
              .map((p) => p[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-900">{name || 'Agent'}</div>
            <div className="text-sm text-slate-500">{user?.email}</div>
            {currentAgent && (
              <div className="text-xs text-slate-400 mt-0.5">{currentAgent.role} · {currentAgent.status}</div>
            )}
          </div>
        </div>

        {msg && <div className="mb-3 text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">{msg}</div>}
        {err && <div className="mb-3 text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{err}</div>}

        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Display name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" placeholder="+1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as AgentStatus)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
                <option value="online">Online</option>
                <option value="busy">Busy</option>
                <option value="away">Away</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
              {['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo', 'Asia/Seoul', 'Asia/Manila'].map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" placeholder="Short intro for your team" />
          </div>
          <button type="submit" disabled={saving}
            className="w-full py-2.5 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save profile'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Change password</h2>
        <form onSubmit={changePassword} className="space-y-3">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6}
            placeholder="New password (min 6 characters)"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
          <button type="submit" disabled={saving || !password}
            className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50">
            Update password
          </button>
        </form>
      </div>
    </div>
  );
}
