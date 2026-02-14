import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import type { ClothingCategory, ClothingItem, ClothingType, Outfit, WeatherNow } from './types';

export function categoryForType(type: ClothingType): ClothingCategory {
  switch (type) {
    case 'Pullover':
    case 'Hoodie':
    case 'T-Shirt':
    case 'Bluse':
    case 'Top':
    case 'Hemd':
      return 'Top';
    case 'Hose':
    case 'Jeans':
    case 'Rock':
      return 'Bottom';
    case 'Jacke':
    case 'Mantel':
      return 'Outerwear';
    case 'Kleid':
      return 'Onepiece';
    case 'Schuhe':
    case 'Sneaker':
    case 'Stiefel':
      return 'Shoes';
    case 'Accessoire':
      return 'Accessory';
    default:
      return 'Top';
  }
}

function daysSince(iso: string | null): number {
  if (!iso) return 999;
  const d = dayjs(iso);
  if (!d.isValid()) return 999;
  return Math.max(0, dayjs().diff(d, 'day'));
}

type Targets = {
  wantsOuterwear: boolean;
  wantsWaterproof: boolean;
  topWarmth: number;
  outerWarmth: number;
  overall: string;
};

export function targetsForWeather(w: WeatherNow | null): Targets {
  const temp = w?.tempC ?? 15;
  const kind = w?.kind ?? 'Other';
  const wantsWaterproof = kind === 'Rain' || kind === 'Drizzle' || kind === 'Thunderstorm' || (w?.rainMm1h ?? 0) > 0;

  // Very rough but pragmatic mapping. Tweak later.
  if (temp <= 0) {
    return { wantsOuterwear: true, wantsWaterproof, topWarmth: 4, outerWarmth: 5, overall: 'eiskalt' };
  }
  if (temp <= 8) {
    return { wantsOuterwear: true, wantsWaterproof, topWarmth: 4, outerWarmth: 4, overall: 'kalt' };
  }
  if (temp <= 15) {
    return { wantsOuterwear: true, wantsWaterproof, topWarmth: 3, outerWarmth: 3, overall: 'kühl' };
  }
  if (temp <= 22) {
    return { wantsOuterwear: false, wantsWaterproof, topWarmth: 2, outerWarmth: 2, overall: 'mild' };
  }
  return { wantsOuterwear: false, wantsWaterproof, topWarmth: 1, outerWarmth: 1, overall: 'warm' };
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function scoreItem(item: ClothingItem, slot: ClothingCategory, targets: Targets): { score: number; why: string[] } {
  const why: string[] = [];
  const r = clamp(item.rating ?? 3, 1, 5);
  const ratingScore = (r - 1) / 4; // 0..1

  const since = daysSince(item.last_worn_at);
  const recencyScore = clamp(since, 0, 30) / 30; // 0..1

  let targetWarmth = 2;
  if (slot === 'Top') targetWarmth = targets.topWarmth;
  if (slot === 'Outerwear') targetWarmth = targets.outerWarmth;
  if (slot === 'Onepiece') targetWarmth = Math.max(targets.topWarmth, targets.outerWarmth - 1);

  const warmthDiff = Math.abs((item.warmth ?? 2) - targetWarmth);
  const warmthScore = 1 - clamp(warmthDiff / 5, 0, 1);

  let waterproofScore = 0;
  if (targets.wantsWaterproof && (slot === 'Outerwear' || slot === 'Shoes')) {
    waterproofScore = item.waterproof ? 1 : -0.5;
    why.push(item.waterproof ? 'regenfest' : 'nicht regenfest');
  }

  const randomJitter = Math.random() * 0.05;

  const score = ratingScore * 0.45 + recencyScore * 0.35 + warmthScore * 0.2 + waterproofScore * 0.1 + randomJitter;

  if (since >= 999) why.push('noch nie getragen');
  else if (since >= 14) why.push(`lange nicht (${since}d)`);
  else if (since <= 2) why.push(`kürzlich (${since}d)`);

  if (warmthScore > 0.8) why.push('passt zur Temperatur');
  else if (warmthScore < 0.4) why.push('Temperatur-Fit naja');

  if (r >= 4) why.push('hoch bewertet');
  if (r <= 2) why.push('niedrig bewertet');

  return { score, why };
}

function pickBest(items: ClothingItem[], slot: ClothingCategory, targets: Targets, excludeId?: string): { picked: ClothingItem | null; why: string[] } {
  const candidates = items.filter((i) => i.category === slot && (!excludeId || i.id !== excludeId));
  if (candidates.length === 0) return { picked: null, why: [] };

  const scored = candidates
    .map((i) => ({ i, ...scoreItem(i, slot, targets) }))
    .sort((a, b) => b.score - a.score);

  // pick from top N for variety
  const N = Math.min(4, scored.length);
  const top = scored.slice(0, N);

  // weighted random among top
  const weights = top.map((t) => Math.max(0.01, t.score));
  const sum = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * sum;
  for (let idx = 0; idx < top.length; idx++) {
    r -= weights[idx];
    if (r <= 0) {
      return { picked: top[idx].i, why: top[idx].why };
    }
  }
  return { picked: top[0].i, why: top[0].why };
}

export function generateOutfit(items: ClothingItem[], weather: WeatherNow | null, wornOn = dayjs().format('YYYY-MM-DD')): Outfit {
  const targets = targetsForWeather(weather);
  const reason: string[] = [];
  reason.push(`Wetter: ${targets.overall}${targets.wantsWaterproof ? ' + Regen' : ''}`);

  const hasOnepiece = items.some((i) => i.category === 'Onepiece');
  const useOnepiece = hasOnepiece && Math.random() < 0.25;

  const slots: Outfit['slots'] = {};

  if (useOnepiece) {
    const one = pickBest(items, 'Onepiece', targets);
    if (one.picked) {
      slots.Onepiece = one.picked;
      reason.push('Kleid-Tag ✨');
      reason.push(...one.why.slice(0, 2));
    }
  } else {
    const top = pickBest(items, 'Top', targets);
    const bottom = pickBest(items, 'Bottom', targets);
    if (top.picked) {
      slots.Top = top.picked;
      reason.push(...top.why.slice(0, 2));
    }
    if (bottom.picked) {
      slots.Bottom = bottom.picked;
    }
  }

  const shoes = pickBest(items, 'Shoes', targets);
  if (shoes.picked) slots.Shoes = shoes.picked;

  if (targets.wantsOuterwear) {
    const outer = pickBest(items, 'Outerwear', targets);
    if (outer.picked) slots.Outerwear = outer.picked;
  }

  // Optional accessory
  if (items.some((i) => i.category === 'Accessory') && Math.random() < 0.3) {
    const acc = pickBest(items, 'Accessory', targets);
    if (acc.picked) slots.Accessory = acc.picked;
  }

  // Score: average of slot scores
  const slotScores = (Object.values(slots) as ClothingItem[])
    .filter(Boolean)
    .map((it) => scoreItem(it, it.category, targets).score);
  const score = slotScores.length ? slotScores.reduce((a, b) => a + b, 0) / slotScores.length : 0;

  return {
    id: nanoid(),
    created_for: wornOn,
    slots,
    score,
    reason
  };
}

export function replaceSlot(
  outfit: Outfit,
  items: ClothingItem[],
  weather: WeatherNow | null,
  slot: ClothingCategory
): Outfit {
  const targets = targetsForWeather(weather);
  const next = structuredClone(outfit) as Outfit;

  const prev = next.slots[slot];
  const { picked } = pickBest(items, slot, targets, prev?.id);
  if (picked) next.slots[slot] = picked;
  next.id = nanoid();
  next.score = generateOutfit(items, weather, outfit.created_for).score;
  return next;
}

export function outfitIsComplete(o: Outfit): boolean {
  const s = o.slots;
  const hasDress = Boolean(s.Onepiece);
  if (hasDress) {
    return Boolean(s.Onepiece) && Boolean(s.Shoes);
  }
  return Boolean(s.Top) && Boolean(s.Bottom) && Boolean(s.Shoes);
}
