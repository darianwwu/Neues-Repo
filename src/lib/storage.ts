import { supabase } from './supabaseClient';

export async function uploadClothingImage(args: {
  userId: string;
  itemId: string;
  blob: Blob;
}): Promise<string> {
  if (!supabase) throw new Error('Supabase not configured');

  const bucket = 'clothes';
  const path = `${args.userId}/${args.itemId}.jpg`;

  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, args.blob, {
    contentType: 'image/jpeg',
    cacheControl: '3600',
    upsert: true
  });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  if (!data.publicUrl) throw new Error('Could not get public URL');

  return data.publicUrl;
}

export async function removeClothingImage(args: { userId: string; itemId: string }) {
  if (!supabase) return;
  const bucket = 'clothes';
  const path = `${args.userId}/${args.itemId}.jpg`;
  await supabase.storage.from(bucket).remove([path]);
}
