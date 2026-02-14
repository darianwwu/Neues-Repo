export type ClothingType =
  | 'Pullover'
  | 'Hoodie'
  | 'T-Shirt'
  | 'Bluse'
  | 'Top'
  | 'Hemd'
  | 'Jacke'
  | 'Mantel'
  | 'Hose'
  | 'Jeans'
  | 'Rock'
  | 'Kleid'
  | 'Schuhe'
  | 'Sneaker'
  | 'Stiefel'
  | 'Accessoire';

export type ClothingCategory =
  | 'Top'
  | 'Bottom'
  | 'Outerwear'
  | 'Onepiece'
  | 'Shoes'
  | 'Accessory';

export type WeatherKind = 'Clear' | 'Clouds' | 'Rain' | 'Drizzle' | 'Thunderstorm' | 'Snow' | 'Fog' | 'Other';

export type ClothingItem = {
  id: string;
  user_id: string;
  name: string | null;
  type: ClothingType;
  category: ClothingCategory;
  image_url: string | null;
  warmth: number; // 0..5
  waterproof: boolean;
  color: string | null;
  tags: string[];
  rating: number | null; // 1..5 (manual)
  last_worn_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Outfit = {
  id: string; // client-side id
  created_for: string; // YYYY-MM-DD
  slots: Partial<Record<ClothingCategory, ClothingItem>>;
  score: number;
  reason: string[];
};

export type WearHistory = {
  id: string;
  user_id: string;
  worn_on: string; // YYYY-MM-DD
  outfit_json: Outfit;
  rating: number | null;
  created_at: string;
};

export type WeatherNow = {
  tempC: number;
  feelsLikeC: number;
  kind: WeatherKind;
  description: string;
  icon: string | null;
  windMs: number;
  humidity: number;
  locationName: string;
  rainMm1h?: number;
  snowMm1h?: number;
};
