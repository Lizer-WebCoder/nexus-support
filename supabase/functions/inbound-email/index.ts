/**
 * Supabase Edge Function: inbound email → email_inbound + ticket
 *
 * Deploy:
 *   supabase functions deploy inbound-email
 *
 * Point Resend / SendGrid / Postmark inbound webhook to:
 *   https://<PROJECT_REF>.supabase.co/functions/v1/inbound-email
 *
 * Optional header: Authorization: Bearer <ANON_OR_SERVICE_KEY>
 * Or set INBOUND_WEBHOOK_SECRET and send x-webhook-secret header.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const secret = Deno.env.get('INBOUND_WEBHOOK_SECRET');
    if (secret && req.headers.get('x-webhook-secret') !== secret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: cors });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')!
    );

    const payload = await req.json();
    // Normalize common providers (Resend / generic)
    const fromEmail =
      payload.from_email ||
      payload.from ||
      payload.sender ||
      payload?.data?.from?.email ||
      '';
    const fromName =
      payload.from_name ||
      payload?.data?.from?.name ||
      (typeof fromEmail === 'string' ? fromEmail.split('@')[0] : 'Email customer');
    const subject = payload.subject || payload?.data?.subject || '(no subject)';
    const body =
      payload.text ||
      payload.body ||
      payload.html ||
      payload?.data?.text ||
      payload?.data?.html ||
      '';

    const { data: emailRow, error: e1 } = await supabase
      .from('email_inbound')
      .insert({
        from_email: String(fromEmail),
        from_name: String(fromName),
        subject: String(subject),
        body: String(body).slice(0, 20000),
        raw: payload,
        processed: false,
      })
      .select('*')
      .single();

    if (e1) throw e1;

    // Create ticket
    const ticketId = `NX-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();
    const { error: e2 } = await supabase.from('tickets').insert({
      id: ticketId,
      title: String(subject).slice(0, 200),
      description: String(body).slice(0, 10000),
      priority: 'medium',
      status: 'new',
      channel: 'email',
      customer_name: String(fromName),
      customer_email: String(fromEmail),
      notes: [],
      messages: [],
      attachments: [],
      created_at: now,
      updated_at: now,
      sla_due_at: new Date(Date.now() + 24 * 3600000).toISOString(),
    });

    if (!e2) {
      await supabase
        .from('email_inbound')
        .update({ processed: true, ticket_id: ticketId })
        .eq('id', emailRow.id);
    }

    return new Response(
      JSON.stringify({ ok: true, ticket_id: e2 ? null : ticketId, email_id: emailRow.id }),
      { headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
