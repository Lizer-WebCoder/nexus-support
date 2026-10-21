import { supabase, isSupabaseConfigured } from './supabase';

const BUCKET = 'attachments';

export type UploadedFile = {
  url: string;
  name: string;
  size: number;
  mime: string;
  storage_path?: string;
};

/** Upload to Supabase Storage when configured; otherwise data-URL fallback. */
export async function uploadAttachment(
  file: File,
  folder = 'tickets'
): Promise<UploadedFile> {
  const mime = file.type || 'application/octet-stream';

  if (isSupabaseConfigured && supabase) {
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: mime,
      upsert: false,
    });
    if (!error) {
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      return {
        url: data.publicUrl,
        name: file.name,
        size: file.size,
        mime,
        storage_path: path,
      };
    }
    console.warn('Storage upload failed, falling back to data URL', error.message);
  }

  // Local / fallback — keep under ~400KB for JSON columns
  if (file.size > 400_000) {
    throw new Error('File too large for local storage (max ~400KB). Enable Supabase Storage for larger files.');
  }
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
  return { url: dataUrl, name: file.name, size: file.size, mime };
}
