import type { Automation, Priority, Ticket } from '../types';

/** Apply enabled automations to a new ticket draft. Returns mutated fields. */
export function applyTicketCreatedAutomations(
  ticket: Pick<Ticket, 'title' | 'description' | 'priority' | 'branch' | 'customer_name'>,
  rules: Automation[]
): { priority?: Priority; tagAdds?: string[] } {
  const out: { priority?: Priority; tagAdds?: string[] } = {};
  const enabled = rules.filter((r) => r.enabled !== false && r.active !== false);

  for (const rule of enabled) {
    if (rule.trigger && rule.trigger !== 'ticket_created') continue;
    const field = (rule.condition_field || 'title').toLowerCase();
    const op = (rule.condition_op || 'contains').toLowerCase();
    const expected = (rule.condition_value || '').toLowerCase();

    let actual = '';
    if (field === 'title') actual = (ticket.title || '').toLowerCase();
    else if (field === 'description') actual = (ticket.description || '').toLowerCase();
    else if (field === 'priority') actual = (ticket.priority || '').toLowerCase();
    else if (field === 'branch') actual = (ticket.branch || '').toLowerCase();
    else if (field === 'customer') actual = (ticket.customer_name || '').toLowerCase();
    else actual = (ticket.title || '').toLowerCase();

    let match = false;
    if (op === 'equals') match = actual === expected;
    else match = actual.includes(expected);

    if (!match) continue;

    const action = (rule.action || 'set_priority').toLowerCase();
    const value = rule.action_value || '';

    if (action === 'set_priority' && ['critical', 'high', 'medium', 'low'].includes(value)) {
      out.priority = value as Priority;
    }
    if (action === 'add_tag' && value.trim()) {
      out.tagAdds = [...(out.tagAdds || []), value.trim()];
    }
  }

  return out;
}
