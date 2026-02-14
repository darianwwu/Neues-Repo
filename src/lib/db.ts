import dayjs from 'dayjs';
import type { ClothingItem, Outfit, WearHistory } from './types';
import { supabase } from './supabaseClient';

export async function listClothingItems(userId: string): Promise<ClothingItem[]> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('clothing_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ClothingItem[];
}

export async function upsertClothingItem(item: Partial<ClothingItem> & { id?: string; user_id: string }) {
  if (!supabase) throw new Error('Supabase not configured');
  const now = new Date().toISOString();
  const payload = { ...item, updated_at: now };
  const { error } = await supabase.from('clothing_items').upsert(payload, { onConflict: 'id' });
  if (error) throw error;
}

export async function deleteClothingItem(userId: string, id: string) {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('clothing_items').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
}

export async function listWearHistory(userId: string, fromDate: string, toDate: string): Promise<WearHistory[]> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('wear_history')
    .select('*')
    .eq('user_id', userId)
    .gte('worn_on', fromDate)
    .lte('worn_on', toDate)
    .order('worn_on', { ascending: false });
  if (error) throw error;
  return (data ?? []) as WearHistory[];
}

export async function getWearHistoryForDay(userId: string, day: string): Promise<WearHistory | null> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('wear_history')
    .select('*')
    .eq('user_id', userId)
    .eq('worn_on', day)
    .maybeSingle();
  if (error) throw error;
  return (data as WearHistory) ?? null;
}

export async function acceptOutfit(userId: string, outfit: Outfit): Promise<WearHistory> {
  if (!supabase) throw new Error('Supabase not configured');
  const wornOn = outfit.created_for || dayjs().format('YYYY-MM-DD');

  // create/overwrite today's history record
  const { data, error } = await supabase
    .from('wear_history')
    .upsert(
      {
        user_id: userId,
        worn_on: wornOn,
        outfit_json: outfit,
        rating: null
      },
      { onConflict: 'user_id,worn_on' }
    )
    .select('*')
    .single();
  if (error) throw error;

  // update last_worn_at on involved items
  const itemIds = Object.values(outfit.slots)
    .filter(Boolean)
    .map((i) => i!.id);

  if (itemIds.length) {
    const { error: upErr } = await supabase
      .from('clothing_items')
      .update({ last_worn_at: new Date().toISOString() })
      .eq('user_id', userId)
      .in('id', itemIds);
    if (upErr) throw upErr;
  }

  return data as WearHistory;
}

export async function rateWearHistory(userId: string, id: string, rating: number) {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase
    .from('wear_history')
    .update({ rating: Math.max(1, Math.min(5, Math.round(rating))) })
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}
