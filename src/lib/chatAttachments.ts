/** Encode/decode file attachments inside chat message text (works without DB columns). */

export type ChatAtt = {
  url: string;
  name?: string;
  mime?: string;
};

const PREFIX = '__ATT__';

export function encodeChatAttachment(att: ChatAtt, caption?: string): string {
  const payload = JSON.stringify({
    url: att.url,
    name: att.name || 'file',
    mime: att.mime || 'application/octet-stream',
  });
  const cap = (caption || '').trim();
  return `${PREFIX}${payload}${cap ? `\n${cap}` : ''}`;
}

export function parseChatAttachment(text: string): { att?: ChatAtt; text: string } {
  if (!text.startsWith(PREFIX)) return { text };
  const rest = text.slice(PREFIX.length);
  const nl = rest.indexOf('\n');
  const jsonPart = nl === -1 ? rest : rest.slice(0, nl);
  const caption = nl === -1 ? '' : rest.slice(nl + 1);
  try {
    const att = JSON.parse(jsonPart) as ChatAtt;
    if (!att?.url) return { text };
    return { att, text: caption };
  } catch {
    return { text };
  }
}

export function isImageMime(mime?: string) {
  return !!mime && mime.startsWith('image/');
}
