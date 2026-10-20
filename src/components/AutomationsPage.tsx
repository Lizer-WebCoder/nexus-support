import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import type { Automation } from '../types';

export default function AutomationsPage() {
  const { automations, saveAutomation, deleteAutomation } = usePlatform();
  const [form, setForm] = useState<Partial<Automation> | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form?.name) return;
    await saveAutomation({
      name: form.name,
      enabled: form.enabled ?? true,
      trigger: form.trigger || 'ticket_created',
      condition_field: form.condition_field || 'title',
      condition_op: form.condition_op || 'contains',
      condition_value: form.condition_value || '',
      action: form.action || 'set_priority',
      action_value: form.action_value || 'high',
      id: form.id,
    });
    setForm(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">Rules that run when tickets are created (priority boost, routing helpers).</p>
        <button type="button" onClick={() => setForm({ name: '', enabled: true, trigger: 'ticket_created', condition_field: 'title', condition_op: 'contains', action: 'set_priority', action_value: 'high' })}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg"><Plus size={16} /> New rule</button>
      </div>

      {form && (
        <form onSubmit={submit} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-sm">
          <input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Rule name" required
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <select value={form.condition_field || 'title'} onChange={(e) => setForm({ ...form, condition_field: e.target.value })}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
              <option value="title">Title</option>
              <option value="priority">Priority</option>
            </select>
            <select value={form.condition_op || 'contains'} onChange={(e) => setForm({ ...form, condition_op: e.target.value })}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
              <option value="contains">contains</option>
              <option value="equals">equals</option>
            </select>
            <input value={form.condition_value || ''} onChange={(e) => setForm({ ...form, condition_value: e.target.value })} placeholder="Value"
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg" />
            <select value={form.action_value || 'high'} onChange={(e) => setForm({ ...form, action: 'set_priority', action_value: e.target.value })}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
              <option value="critical">Set critical</option>
              <option value="high">Set high</option>
              <option value="medium">Set medium</option>
              <option value="low">Set low</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg">Save</button>
            <button type="button" onClick={() => setForm(null)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y">
        {automations.map((a) => (
          <div key={a.id} className="px-5 py-4 flex items-center gap-3">
            <button type="button" onClick={() => saveAutomation({ ...a, enabled: !a.enabled })}
              className={`w-10 h-6 rounded-full relative transition-colors ${a.enabled ? 'bg-emerald-500' : 'bg-slate-200'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${a.enabled ? 'left-4' : 'left-0.5'}`} />
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-800">{a.name}</div>
              <div className="text-xs text-slate-500">
                If {a.condition_field} {a.condition_op} “{a.condition_value}” → {a.action} {a.action_value}
              </div>
            </div>
            <button type="button" onClick={() => deleteAutomation(a.id)} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 size={16} /></button>
          </div>
        ))}
        {automations.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">No automations yet</div>}
      </div>
    </div>
  );
}
