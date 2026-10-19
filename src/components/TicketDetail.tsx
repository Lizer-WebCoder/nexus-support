import { useState } from 'react';
import { X, Trash2, MessageSquare } from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import type { Ticket, Priority, Status } from '../types';

interface Props {
  ticket: Ticket;
  onClose: () => void;
}

export default function TicketDetail({ ticket, onClose }: Props) {
  const { updateTicket, deleteTicket, addNote, agents } = useTickets();
  const [status, setStatus] = useState<Status>(ticket.status);
  const [priority, setPriority] = useState<Priority>(ticket.priority);
  const [assigneeId, setAssigneeId] = useState(ticket.assignee_id || '');
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await updateTicket(ticket.id, {
        status,
        priority,
        assignee_id: assigneeId || null,
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteTicket(ticket.id);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    await addNote(ticket.id, noteText);
    setNoteText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <div className="text-xs font-mono text-slate-400">{ticket.id}</div>
            <h2 className="text-lg font-semibold text-slate-900 leading-tight">{ticket.title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase mb-1">Customer</div>
            <div className="text-sm font-medium text-slate-800">{ticket.customer_name}</div>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-400 uppercase mb-1">Description</div>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {ticket.description || 'No description provided.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-slate-400 uppercase mb-1">Channel</div>
              <div className="text-sm capitalize text-slate-800">{ticket.channel}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400 uppercase mb-1">Created</div>
              <div className="text-sm text-slate-800">{new Date(ticket.created_at).toLocaleString()}</div>
            </div>
          </div>

          <hr className="border-slate-200" />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as Status)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
              <option value="new">New</option>
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="on-hold">On Hold</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assignee</label>
            <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
              <option value="">Unassigned</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <button onClick={save} disabled={saving}
            className="w-full py-2.5 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          <hr className="border-slate-200" />

          {/* Notes */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={16} className="text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-800">Internal notes</h3>
            </div>
            <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
              {(ticket.notes || []).length === 0 && (
                <p className="text-xs text-slate-400">No notes yet</p>
              )}
              {(ticket.notes || []).map((n) => (
                <div key={n.id} className="bg-slate-50 rounded-lg px-3 py-2 text-sm">
                  <div className="text-slate-700">{n.text}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {n.author} · {new Date(n.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                placeholder="Add a note..."
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30"
              />
              <button onClick={handleAddNote} disabled={!noteText.trim()}
                className="px-3 py-2 text-sm font-medium bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-40">
                Add
              </button>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Delete */}
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)}
              className="w-full py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg flex items-center justify-center gap-2">
              <Trash2 size={16} /> Delete ticket
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleDelete} disabled={saving}
                className="flex-1 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg disabled:opacity-50">
                Confirm delete
              </button>
              <button onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
