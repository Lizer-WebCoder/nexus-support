import type { AuditEntry } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const KEY = 'nexus-audit-v1';

export function pushAudit(
  entry: Omit<AuditEntry, 'id' | 'created_at'> & { id?: string; created_at?: string }
) {
  const row: AuditEntry = {
    id: entry.id || `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    entity: entry.entity,
    entity_id: entry.entity_id,
    action: entry.action,
    detail: entry.detail,
    actor: entry.actor,
    created_at: entry.created_at || new Date().toISOString(),
  };
  try {
    const prev = JSON.parse(localStorage.getItem(KEY) || '[]') as AuditEntry[];
    const next = [row, ...prev].slice(0, 200);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}

  // Best-effort cloud persistence
  if (isSupabaseConfigured && supabase) {
    void supabase.from('audit_log').insert({
      entity: row.entity,
      entity_id: row.entity_id,
      action: row.action,
      detail: row.detail || null,
      actor: row.actor || null,
      created_at: row.created_at,
    });
  }
  return row;
}

export function loadAudit(): AuditEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]') as AuditEntry[];
  } catch {
    return [];
  }
}

export async function loadAuditCloud(): Promise<AuditEntry[]> {
  if (!isSupabaseConfigured || !supabase) return loadAudit();
  const { data } = await supabase
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  if (data?.length) return data as AuditEntry[];
  return loadAudit();
}
